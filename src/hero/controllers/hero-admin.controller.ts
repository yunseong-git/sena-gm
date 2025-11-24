import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { HeroService } from '../hero.service.js';
import { CreateHeroDto } from '../dto/create-hero.dto.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { UpdateHeroDto } from '../dto/update-hero.dto.js';
import { Public } from '#src/common/decorators/public.decorators.js';
import { AdminGuard } from '#src/common/guards/admin.guard.js';
import { UserRoles } from '#src/common/decorators/user-roles.decorator.js';
import { User_Role_Enum } from '#src/user/user.schema.js';


@UseGuards(AdminGuard)
@UserRoles(User_Role_Enum.ADMIN)
@Controller('hero-admin')
export class HeroAdminController {
    constructor(private readonly heroService: HeroService) {
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body() createHeroDto: CreateHeroDto) {
        return this.heroService.create(createHeroDto);
    }

    @Patch(':id')
    update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateHeroDto: UpdateHeroDto) {
        return this.heroService.update(id, updateHeroDto);
    }

    @Public() 
    @Post('seed') 
    @HttpCode(HttpStatus.OK)
    async seedHeroes() {
        return this.heroService.seed();
    }
}