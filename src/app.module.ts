import { Module, RequestMethod, MiddlewareConsumer } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ConfigModule } from "@nestjs/config";
import { PodcastsModule } from "./podcast/podcasts.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Podcast } from "./podcast/entities/podcast.entity";
import { Episode } from "./podcast/entities/episode.entity";
import { Review } from "./podcast/entities/review.entity";
import { User } from "./users/entities/user.entity";
import { UsersModule } from "./users/users.module";
import * as Joi from "joi";
import { JwtModule } from "./jwt/jwt.module";
import { JwtMiddleware } from "./jwt/jwt.middleware";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
      ignoreEnvFile: process.env.NODE_ENV === "production",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("dev", "production", "test").required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string(),
        PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),
      synchronize: process.env.NODE_ENV !== "production",
      logging:
        process.env.NODE_ENV !== "production" &&
        process.env.NODE_ENV !== "test",
      entities: [Podcast, Episode, User, Review],
    }),
    GraphQLModule.forRoot({
      playground: true,
      autoSchemaFile: true,
      context: ({ req }) => {
        return { user: req["user"] };
      },
    }),
    JwtModule.forRoot({
      privateKey: "8mMJe5dMGORyoRPLvngA8U4aLTF3WasX",
    }),
    PodcastsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: "/graphql",
      method: RequestMethod.POST,
    });
  }
}
