import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionService {
  constructor(private dataSource: DataSource) {}

  async invalidateSessionsByUserId(userId: string): Promise<number> {
    const result: Array<{ sid: string }> = await this.dataSource.query(
      `DELETE FROM "session" WHERE sess::json->'passport'->>'user' = $1 RETURNING sid`,
      [userId],
    );
    return result.length;
  }
}
