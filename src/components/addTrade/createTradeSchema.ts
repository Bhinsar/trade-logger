import * as yup from "yup";

export const createTradeSchema = yup.object({
  symbol: yup.string().required("Symbol is required"),
  entry_price: yup.number().typeError("Entry price must be a number").min(0, "Entry price must be 0 or greater").required("Entry price is required"),
  exit_price: yup.number().typeError("Exit price must be a number").min(0, "Exit price must be 0 or greater").required("Exit price is required"),
  quantity: yup.number().typeError("Quantity must be a number").positive("Quantity must be greater than 0").required("Quantity is required"),
  pnl_nominal: yup.number().typeError("PnL nominal must be a number").required("PnL nominal is required"),
  pnl_percentage: yup.number().typeError("PnL percentage must be a number").required("PnL percentage is required"),
  entry_time: yup.date()
    .transform((curr, orig) => orig === '' ? null : curr)
    .typeError("Entry time must be a valid date")
    .required("Entry time is required")
    .test('is-valid-time', 'Entry time cannot be in the future', value => {
      if (!value) return true;
      return value <= new Date();
    }),
  exit_time: yup.date()
    .transform((curr, orig) => orig === '' ? null : curr)
    .typeError("Exit time must be a valid date")
    .required("Exit time is required")
    .test('is-valid-time', 'Exit time cannot be in the future', value => {
      if (!value) return true;
      return value <= new Date();
    })
    .min(yup.ref('entry_time'), "Exit time must be after entry time"),
  strategy_id: yup.string().required("Strategy is required"),
  notes: yup.string().nullable().optional(),
  trade_doc_url: yup.array().of(yup.string().url("Must be a valid URL").required()).nullable().optional().max(5, "Maximum 5 documents allowed"),
  side: yup.string().oneOf(["Long", "Short"], "Trade side is required").required("Trade side is required") as yup.StringSchema<"Long" | "Short">,
  asset_class: yup.string().oneOf(["Equity", "Crypto", "Forex", "Options"], "Asset class is required").required("Asset class is required") as yup.StringSchema<"Equity" | "Crypto" | "Forex" | "Options">,
  entry_confidence: yup.number().typeError("Must be a number").min(1).max(10).nullable().optional(),
  satisfaction_rating: yup.number().typeError("Must be a number").min(1).max(10).nullable().optional(),
  mistakes_made: yup.array().of(yup.string().required()).nullable().optional(),
  lessons_learned: yup.array().of(yup.string().required()).nullable().optional(),
});

export type CreateTradeInput = yup.InferType<typeof createTradeSchema>;
