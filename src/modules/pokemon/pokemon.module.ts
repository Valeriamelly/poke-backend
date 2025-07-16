import { Module } from '@nestjs/common';
import { PokemonController } from './controller/pokemon.controller';
import { PokemonService } from './service/pokemon.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PokemonController],
  providers: [PokemonService],
})
export class PokemonModule {}
