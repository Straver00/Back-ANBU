import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsDateString } from 'class-validator';

export class ChatPaginationQueryDto {
  @IsOptional()
  @IsInt({ message: 'take must be an integer' })
  @Min(1, { message: 'take must be at least 1' })
  @Max(100, { message: 'take cannot exceed 100' })
  @Type(() => Number)
  take?: number = 50;

  @IsOptional()
  @IsDateString({}, { message: 'before must be a valid ISO date string' })
  before?: string;
}
