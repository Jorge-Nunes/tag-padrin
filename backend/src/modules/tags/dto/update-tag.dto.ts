import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTagDto {
    @IsOptional()
    @IsString()
    brgpsId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    imei?: string;

    @IsOptional()
    @IsString()
    traccarUrl?: string;
}
