const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { exiftool } = require('exiftool-vendored');
const fs = require('fs');
const os = require('os');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');

const bucketName = 'livenapalm-photos';
const region = 'us-west-2';
const outputFile = path.join(__dirname, '../photo-exif.json');

const s3 = new S3Client({ region });

const EXIF_KEYS = [
  'Model',
  'LensModel',
  'FocalLength',
  'ExposureTime',
  'FNumber',
  'ISO',
  'CreateDate',
  'GPSPosition',
  'Flash',
  'ImageSize',
];

async function listAllJpgObjects() {
  let objects = [];
  let ContinuationToken;
  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: '', // all objects
      ContinuationToken,
    });
    const response = await s3.send(command);
    const jpgs = (response.Contents || []).filter(obj => obj.Key && /\.(jpe?g)$/i.test(obj.Key));
    objects = objects.concat(jpgs.map(obj => obj.Key));
    ContinuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return objects;
}

async function downloadS3Object(key, destPath) {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  const response = await s3.send(command);
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destPath);
    response.Body.pipe(fileStream);
    response.Body.on('error', reject);
    fileStream.on('finish', resolve);
  });
}

async function extractExifFromS3() {
  const exifData = {};
  const objects = await listAllJpgObjects();
  for (const key of objects) {
    const tmpPath = path.join(os.tmpdir(), path.basename(key));
    try {
      await downloadS3Object(key, tmpPath);
      const tags = await exiftool.read(tmpPath);
      // Only keep selected EXIF keys
      const filteredTags = {};
      for (const exifKey of EXIF_KEYS) {
        if (tags[exifKey] !== undefined) {
          filteredTags[exifKey] = tags[exifKey];
        }
      }
      exifData[key] = filteredTags;
      console.log(`Extracted EXIF for ${key}`);
    } catch (err) {
      console.warn(`Failed to extract EXIF for ${key}:`, err.message);
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  }
  fs.writeFileSync(outputFile, JSON.stringify(exifData, null, 2));
  await exiftool.end();
  console.log(`EXIF extraction complete. Data written to ${outputFile}`);
}

extractExifFromS3();