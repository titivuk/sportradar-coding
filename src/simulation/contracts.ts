import z from 'zod';

export type SimulationConnectionQuery = {
  name: string;
  clientId: string;
};

const simulationNameSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (val.length < 8 || val.length > 30) {
        return false;
      }

      const matchResult = val.match(/^[a-z0-9 ]+$/i);
      if (!matchResult || matchResult.length < 1) {
        return false;
      }

      return true;
    },
    {
      message:
        '"name" should have minimum 8 characters, maximum 30 characters, only digits, whitespaces or alphabetic characters',
    },
  );

export const simulationConnectionQuerySchema = z.object({
  name: simulationNameSchema,
  clientId: z.string().uuid(),
}) satisfies z.ZodType<SimulationConnectionQuery>;
