# Grupo-17-TP-2-IA

## Requerimientos

Node js >= 6.9

## Instalar dependencias

`npm install`

## Variables de entorno

Se encuentran en el archivo .env

* POPULATION_SIZE:Tamaño de la población inicial
* MUTATION_PROBABILITY: Probabilidad de mutación
* RUNS_NUMBER: Número de corridas a realizar
* SELECTION: Puede ser `ROULETTEWHEELSELECTION`, `RANK` o `TOURNAMENT`
* CROSSOVER: Puede ser `RANDOM`, `MULTIPOINT` o `MASK`
* MULTIPOINT: Si en crossover se selecciono `MULTIPOINT` utilizar esta variable para establecer el array de los puntos de corte. Ej: [2,4]
* MASK: Si en crossover se selecciono `MASK` utilizar esta variable para establecer la máscara. Ej: 112112
* FILE: Path del archivo donde se escribirñán los resultados de cada corrida (generation, minimum, maximum, best, mean, standarDeviation)