import { Module } from '@nestjs/common';
import { SimulationGateway } from './simulation.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [SimulationGateway],
})
export class SimulationModule {}
