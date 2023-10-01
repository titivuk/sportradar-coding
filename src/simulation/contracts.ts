import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, IsUUID, Length, Matches } from 'class-validator';

export class StartSimulationDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(8, 30)
  @Matches(/^[a-z0-9 ]+$/i, {
    message:
      '"name" should have minimum 8 characters, maximum 30 characters, only digits, whitespaces or alphabetic characters',
  })
  name: string;
}

export class FinishSimulationDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsUUID('4')
  id: string;
}

export enum GatewayEvents {
  Start = 'start',
  Finish = 'finish',
}
