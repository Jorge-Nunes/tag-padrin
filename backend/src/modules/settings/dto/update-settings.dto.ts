import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSettingsDto {
    @IsOptional()
    @IsNumber()
    @Min(30)
    syncInterval?: number;

    @IsOptional()
    @IsString()
    brgpsBaseUrl?: string;

    @IsOptional()
    @IsString()
    brgpsToken?: string;
}
