import { Controller, Get } from "@nestjs/common";
import { CANONICAL_STATES, FLAGS } from "./constants";

@Controller("api/meta")
export class MetaController {
  @Get()
  meta() {
    return { states: CANONICAL_STATES, flags: FLAGS };
  }
}
