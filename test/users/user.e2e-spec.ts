import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from '../../src/users/user.module';
import { UserService } from '../../src/users/user.service';
import { INestApplication } from '@nestjs/common';

describe('User', () => {
  let app: INestApplication;
  const userService = { getHello: () => 'Hello World!' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET user`, () => {
    return request(app.getHttpServer()).get('/user').expect(200).expect(userService.getHello());
  });

  afterAll(async () => {
    await app.close();
  });
});
