import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListPokemonDto } from '../dto/list-pokemon.dto';
import { firstValueFrom } from 'rxjs';

export interface Pokemon {
  name: string;
  url: string;
}
export interface PokeList {
  count: number;
  results: Pokemon[];
}
@Injectable()
export class PokemonService {
  private readonly api: string;
  private readonly masterKey = 'pokemon:master-list';
  private readonly masterTTL = 24 * 60 * 60;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {
    this.api =
      this.config.get<string>('pokeApi') || 'https://pokeapi.co/api/v2';
  }

  async list(dto: ListPokemonDto) {
    const { limit, offset, q } = dto;
    let master = await this.cache.get<Pokemon[]>(this.masterKey);

    if (!master) {
      const url = `${this.api}/pokemon?limit=2000&offset=0`;
      const { data } = await firstValueFrom(this.http.get<PokeList>(url));
      master = data.results;
      await this.cache.set(this.masterKey, master, this.masterTTL);
    }

    // Filtrar por nombre
    const filtered = q
      ? master.filter((pokemon) => pokemon.name.includes(q.toLowerCase()))
      : master;

    // Paginación
    const paginated = filtered.slice(offset, offset + limit);

    const payload: PokeList = { count: filtered.length, results: paginated };

    return payload;
  }
}
