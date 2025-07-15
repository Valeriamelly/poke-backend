export default () => ({
  pokeApi: process.env.POKEAPI,
  cacheTTL: parseInt(process.env.CACHE_TTL ?? '1800', 10),
});
