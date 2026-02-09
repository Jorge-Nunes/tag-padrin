import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSettingsDto {
    @IsOptional()
    @IsInt()
    @Min(30)
    syncInterval?: number;

    @IsOptional()
    @IsString()
    brgpsBaseUrl?: string;

    @IsOptional()
    @IsString()
    brgpsToken?: string;

    @IsOptional()
    @IsString()
    traccarUrl?: string;

    @IsOptional()
    @IsString()
    traccarToken?: string;
}
