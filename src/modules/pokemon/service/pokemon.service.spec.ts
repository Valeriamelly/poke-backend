// src/modules/pokemon/service/pokemon.service.spec.ts
import { Test } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of } from 'rxjs';
import { ListPokemonDto } from '../dto/list-pokemon.dto';
import { ConfigService } from '@nestjs/config';

describe('PokemonService (conciso)', () => {
  let service: PokemonService;
  const cacheMock = { get: jest.fn(), set: jest.fn() };
  const httpMock = { get: jest.fn() };
  const configMock = {
    get: jest.fn().mockReturnValue('https://pokeapi.co/api/v2'),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PokemonService,
        { provide: HttpService, useValue: httpMock },
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(PokemonService);
  });

  afterEach(() => jest.resetAllMocks());

  it('usa el caché si existe', async () => {
    const cached = { count: 1, results: [{ name: 'pikachu' }] };
    cacheMock.get.mockResolvedValue(cached);

    const dto: ListPokemonDto = { limit: 20, offset: 0, q: 'pika' };
    const res = await service.list(dto);
    console.log('Resultado con caché:', res);

    // Verifica que se use el caché
    expect(res).toEqual(cached);
    // Verifica que no se guarde en caché ni se haga petición a la API
    expect(cacheMock.set).not.toHaveBeenCalled();
    expect(httpMock.get).not.toHaveBeenCalled();
  });

  it('debe buscar en la API si no hay caché', async () => {
    cacheMock.get.mockResolvedValue(undefined);

    const apiPayload = {
      count: 5,
      results: [
        { name: 'bulbasaur' },
        { name: 'ivysaur' },
        { name: 'venusaur' },
      ],
    };
    console.log(apiPayload);

    const expected = {
      count: 1,
      results: [{ name: 'bulbasaur' }],
    };

    httpMock.get.mockReturnValue(of({ data: apiPayload }));

    const dto: ListPokemonDto = { limit: 10, offset: 0, q: 'bulba' };
    const res = await service.list(dto);

    console.log('Resultado sin caché:', res);

    // Guarda en caché
    expect(cacheMock.set).toHaveBeenCalledWith(expect.any(String), expected);
    // resultado filtrado
    expect(res).toEqual(expected);
    // llama a la API
    expect(httpMock.get).toHaveBeenCalledWith();
  });
});
