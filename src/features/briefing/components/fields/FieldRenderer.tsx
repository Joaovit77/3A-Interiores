"use client";

import { ChoiceField } from "./ChoiceField";
import { ConsentField } from "./ConsentField";
import { CounterField } from "./CounterField";
import { MatrixField } from "./MatrixField";
import { NumberField } from "./NumberField";
import { RoomsField } from "./RoomsField";
import { TextField } from "./TextField";
import type { FieldProps } from "./types";
import { UploadField } from "./UploadField";

export function FieldRenderer(props: FieldProps) {
  switch (props.field.def.kind) {
    case "choice":
      return <ChoiceField {...props} />;
    case "counter":
      return <CounterField {...props} />;
    case "number":
      return <NumberField {...props} />;
    case "rooms":
      return <RoomsField {...props} />;
    case "upload":
      return <UploadField {...props} />;
    case "matrix":
      return <MatrixField {...props} />;
    case "consent":
      return <ConsentField {...props} />;
    default:
      return <TextField {...props} />;
  }
}
