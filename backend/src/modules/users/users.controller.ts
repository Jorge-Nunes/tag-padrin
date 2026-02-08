import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @SetMetadata('roles', ['ADMIN'])
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @SetMetadata('roles', ['ADMIN'])
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @SetMetadata('roles', ['ADMIN'])
    create(@Body() data: { email: string; name?: string; password?: string; role: 'ADMIN' | 'OPERATOR' }) {
        return this.usersService.create(data);
    }

    @Patch(':id')
    @SetMetadata('roles', ['ADMIN'])
    update(@Param('id') id: string, @Body() data: { email?: string; name?: string; role?: 'ADMIN' | 'OPERATOR' }) {
        return this.usersService.update(id, data);
    }

    @Patch(':id/password')
    @SetMetadata('roles', ['ADMIN'])
    changePassword(@Param('id') id: string, @Body('password') password: string) {
        return this.usersService.changePassword(id, password);
    }

    @Delete(':id')
    @SetMetadata('roles', ['ADMIN'])
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
