import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from "aws-sdk";

AWS.config.update({
  credentials: {
    accessKeyId: "AKIA2KIUCWZOPAJ5PUUN",
    secretAccessKey: "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",
  },
});

const BUCKET_NAME = "mjpodcastclonemandoo372";

@Controller("/upload")
export class UploadController {
  @Post("")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file) {
    try {
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: "public-read",
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      return null;
    }
  }
}
