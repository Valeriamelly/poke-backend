import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListPokemonDto } from './dto/list-pokemon.dto';
import { firstValueFrom } from 'rxjs';

interface PokeList {
  count: number;
  results: {
    name: string;
    url: string;
  }[];
}
@Injectable()
export class PokemonService {
  private readonly api: string;

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
    const key = `list-${limit}-${offset}-${q}`;

    // Leer caché
    const cached = await this.cache.get(key);
    if (cached) {
      return cached;
    }

    // Hacer petición a la API
    const url = `${this.api}/pokemon?limit=${limit}&offset=${offset}`;
    const { data } = await firstValueFrom(this.http.get<PokeList>(url));

    // Filtrar resultados por nombre

    const filtered = q
      ? data.results.filter((pokemon) => pokemon.name.includes(q.toLowerCase()))
      : data.results;

    const payload = { count: filtered.length, results: filtered };

    // Guardar en caché
    await this.cache.set(key, payload);

    return payload;
  }
}
