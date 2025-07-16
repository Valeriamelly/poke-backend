import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsNotEmpty, IsOptional } from 'class-validator';

export class ListPokemonDto {
  // limit: número de página
  // offset: cantidad de resultados por página
  // q: búsqueda por nombre

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit!: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset!: number;

  @IsOptional()
  @IsNotEmpty()
  q?: string;
}
