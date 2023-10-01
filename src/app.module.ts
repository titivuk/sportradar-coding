import { Module } from '@nestjs/common';
import { SimulationModule } from './simulation/simulation.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    SimulationModule,
    ThrottlerModule.forRoot([
      {
        ttl: 5 * 60e3,
        limit: 1,
      },
    ]),
  ],
})
export class AppModule {}
