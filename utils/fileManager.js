import AWS from 'aws-sdk'

// import fileUpload from 'express-fileupload'
// export const config = { api: { bodyParser: false } }
// handler.use(fileUpload())

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.APPLICATION_KEY_ID,
  secretAccessKey: process.env.APPLICATION_KEY,
})

export const upload = async (args) => {
  const { fileName, fileType, pathName } = args

  if (!fileName) {
    throw new Error('Please, upload a file')
  }

  const fullName = fileName && fileName.name.split('.').shift()
  const extension = fileName && fileName.name.split('.').pop()

  const fullFileName = fileName && `${fullName}-${Date.now()}.${extension}`

  const files = /(\.pdf|\.docx|\.doc|\.txt)$/i
  const images = /(\.jpg|\.jpeg|\.png|\.gif|\.svg)$/i

  if (fileName.size > 1000000) {
    throw new Error(
      `The file is too large and cannot be uploaded. Please reduce the size of the file. Maximum is 1MB`
    )
  }

  if (fileType === 'file' && !files.exec(fileName && fullFileName)) {
    throw new Error(`${extension} extension is not allowed`)
  } else if (fileType === 'image' && !images.exec(fileName && fullFileName)) {
    throw new Error(`${extension} extension is not allowed`)
  } else {
    const params = {
      Bucket: process.env.APPLICATION_KEY_NAME,
      Key: `${pathName}/${fullFileName}`,
      Body: fileName.data,
    }

    const upload = await s3
      .upload(params, (err, data) => {
        if (err) throw err

        return data
      })
      .promise()
    return {
      fullFileName: upload.Key,
      filePath: upload.Location,
    }
  }
}

export const deleteFile = async (args) => {
  const { pathName } = args

  const params = {
    Bucket: process.env.APPLICATION_KEY_NAME,
    Key: pathName,
  }

  const deleteObject = await s3
    .deleteObject(params, (err, data) => {
      if (err) throw err
      return data
    })
    .promise()

  if (!deleteObject.DeleteMarker) {
    throw new Error('Please, upload a file')
  }

  return deleteObject
}
