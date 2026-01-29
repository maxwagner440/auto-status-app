import { Body, Controller, Get, Param, Post, Put, UseGuards, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as crypto from "crypto";
import { JobEntity } from "./entities/job.entity";
import { ShopEntity } from "./entities/shop.entity";
import { AuthGuard } from "./auth/auth.guard";
import { CANONICAL_STATES, FLAGS } from "./constants";

type CreateJobDto = { customerContact: string; vehicleLabel: string };
type UpdateJobDto = { stateKey?: string; flagKey?: string; active?: boolean };

function randomToken() {
  return crypto.randomBytes(9).toString("base64url");
}
function isValidState(key: string) {
  return CANONICAL_STATES.some((s) => s.key === key);
}
function isValidFlag(key: string) {
  return FLAGS.some((f) => f.key === key);
}

function extractPhoneLast4(customerContact: string): string | null {
  // Extract last 4 digits from phone number
  // Handles formats like: +1 555-1234, (555) 123-4567, 5551234567, etc.
  const digits = customerContact.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return null;
}

@Controller("api/admin")
@UseGuards(AuthGuard)
export class JobsController {
  constructor(
    @InjectRepository(JobEntity) private readonly jobRepo: Repository<JobEntity>,
    @InjectRepository(ShopEntity) private readonly shopRepo: Repository<ShopEntity>,
  ) {}

  private extractPhoneLast4 = extractPhoneLast4;

  private async getShopByKey(shopKey: string): Promise<ShopEntity> {
    const shop = await this.shopRepo.findOne({ where: { shopKey } });
    if (!shop) {
      throw new HttpException("Shop not found", HttpStatus.NOT_FOUND);
    }
    return shop;
  }

  @Get(":shopKey/jobs")
  async list(@Param("shopKey") shopKey: string) {
    const shop = await this.getShopByKey(shopKey);
    return this.jobRepo.find({ 
      where: { shopId: shop.id },
      order: { updatedAt: "DESC" } 
    });
  }

  @Post(":shopKey/jobs")
  async create(@Param("shopKey") shopKey: string, @Body() body: CreateJobDto) {
    if (!body?.customerContact || !body?.vehicleLabel) {
      throw new HttpException("customerContact and vehicleLabel are required", HttpStatus.BAD_REQUEST);
    }
    const shop = await this.getShopByKey(shopKey);
    const customerContact = String(body.customerContact);
    // Extract last 4 digits from phone number if it's a phone
    const customerPhoneLast4 = this.extractPhoneLast4(customerContact);
    
    const job = this.jobRepo.create({
      token: randomToken(),
      customerContact,
      customerPhoneLast4,
      vehicleLabel: String(body.vehicleLabel),
      stateKey: "CHECKED_IN",
      flagKey: "NONE",
      active: true,
      shopId: shop.id,
    });
    return this.jobRepo.save(job);
  }

  @Get(":shopKey/jobs/:id")
  async get(@Param("shopKey") shopKey: string, @Param("id") id: string) {
    const shop = await this.getShopByKey(shopKey);
    const job = await this.jobRepo.findOne({ where: { id, shopId: shop.id } });
    if (!job) throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    return job;
  }

  @Put(":shopKey/jobs/:id")
  async update(@Param("shopKey") shopKey: string, @Param("id") id: string, @Body() body: UpdateJobDto) {
    const shop = await this.getShopByKey(shopKey);
    const job = await this.jobRepo.findOne({ where: { id, shopId: shop.id } });
    if (!job) throw new HttpException("Not found", HttpStatus.NOT_FOUND);

    // Prevent updates to inactive jobs (except reactivation)
    if (!job.active && body.active !== true && (body.stateKey || body.flagKey)) {
      throw new HttpException("Cannot update an inactive job. Reactivate it first.", HttpStatus.BAD_REQUEST);
    }

    if (body.stateKey && !isValidState(body.stateKey)) throw new HttpException("Invalid stateKey", HttpStatus.BAD_REQUEST);
    if (body.flagKey && !isValidFlag(body.flagKey)) throw new HttpException("Invalid flagKey", HttpStatus.BAD_REQUEST);

    if (body.stateKey) job.stateKey = body.stateKey;
    if (body.flagKey) job.flagKey = body.flagKey;
    if (body.active !== undefined) job.active = body.active;

    return this.jobRepo.save(job);
  }
}
