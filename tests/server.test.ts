import { expect, test } from 'bun:test';
import * as server from '../index';

test('server status', async () => {
  expect((await fetch(`http://localhost:${server.PORT}/`)).status).toBe(200)
});

let room_id = '';
test('server login', async () => {
  const response = await (await fetch(`http://localhost:${server.PORT}/login?player_email=bun-test`)).json();
  room_id = response.data._ID;
  expect(room_id === undefined).toBe(false);
  expect(response.data.players['bun-test'].username).toBe('bun-test');
});

test('server logout', async () => {
  const response = await fetch(`http://localhost:${server.PORT}/logout?player_email=bun-test&room_id=${room_id}`);
  expect(response.status).toBe(200);
});