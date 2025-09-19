import { Injectable } from '@nestjs/common';
import { CreatePickDto } from './dto/create-pick.dto';
import { UpdatePickDto } from './dto/update-pick.dto';

@Injectable()
export class PickService {
  create(createPickDto: CreatePickDto) {
    return 'This action adds a new pick';
  }

  findAll() {
    return `This action returns all pick`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pick`;
  }

  update(id: number, updatePickDto: UpdatePickDto) {
    return `This action updates a #${id} pick`;
  }

  remove(id: number) {
    return `This action removes a #${id} pick`;
  }
}
