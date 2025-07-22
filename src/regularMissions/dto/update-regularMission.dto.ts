import { PartialType } from '@nestjs/mapped-types';
import { CreateRegularMissionDto } from './create-regularMission.dto';

export class UpdateRegularMissionDto extends PartialType(
  CreateRegularMissionDto,
) {}
