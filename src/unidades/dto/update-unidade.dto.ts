import { PartialType } from "@nestjs/mapped-types";
import { CreateUnidadDto } from "./create-unidade.dto";

export class UpdateUnidadDto extends PartialType(CreateUnidadDto) {}
