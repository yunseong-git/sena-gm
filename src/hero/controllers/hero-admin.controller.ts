import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { HeroService } from '../hero.service';
import { CreateHeroDto } from '../dto/create-hero.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { UpdateHeroDto } from '../dto/update-hero.dto';
import { Public } from '../../common/decorators/public.decorators';
import { UserRoles } from '../../common/decorators/user-roles.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { User_Role_Enum } from '../../user/schemas/user.schema';


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