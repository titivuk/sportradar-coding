import { Module } from '@nestjs/common';
import { SimulationGateway } from './simulation.gateway';
import { SimulationRegistry } from './simulation-registry';

@Module({
  providers: [SimulationGateway, SimulationRegistry],
})
export class SimulationModule {}
