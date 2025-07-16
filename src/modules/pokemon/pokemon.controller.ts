import { Controller, Get, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { ListPokemonDto } from './dto/list-pokemon.dto';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  list(@Query() dto: ListPokemonDto) {
    return this.pokemonService.list(dto);
  }
}
