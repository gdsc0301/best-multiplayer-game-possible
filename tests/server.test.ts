import { describe, expect, test } from 'bun:test';
import * as server from '../index';

describe('server', () => {
  test('status', async () => {
    expect((await fetch(`http://localhost:${server.PORT}/`)).status).toBe(200)
  });

  let room_id = '';
  test('login', async () => {
    const response = await (await fetch(`http://localhost:${server.PORT}/login?player_email=bun-test`)).json();
    room_id = response.data._ID;
    expect(room_id === undefined).toBe(false);
    expect(response.data.players['bun-test'].username).toBe('bun-test');
  });

  test('logout', async () => {
    const response = await fetch(`http://localhost:${server.PORT}/logout?player_email=bun-test&room_id=${room_id}`);
    expect(response.status).toBe(200);
  });

  test.todo('force unknown path', async () => {
    const response = await fetch(`http://localhost:${server.PORT}/unknown-path`);
    expect(response.status).toBe(404);
  });

  test('force unknown method', async () => {
    const response = await fetch(`http://localhost:${server.PORT}/`, { method: 'PUT' });
    expect(response.status).toBe(405);
  });
});