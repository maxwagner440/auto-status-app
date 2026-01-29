import { Controller, Get, Param, Query, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShopEntity } from "./entities/shop.entity";
import { JobEntity } from "./entities/job.entity";
import { CANONICAL_STATES, FLAGS } from "./constants";

function findState(key: string) {
  return CANONICAL_STATES.find((s) => s.key === key);
}
function findFlag(key: string) {
  return FLAGS.find((f) => f.key === key);
}

@Controller("api/public")
export class PublicController {
  constructor(
    @InjectRepository(ShopEntity) private readonly shopRepo: Repository<ShopEntity>,
    @InjectRepository(JobEntity) private readonly jobRepo: Repository<JobEntity>,
  ) {}

  @Get("health")
  health() {
    return { ok: true };
  }

  @Get(":shopKey/status/:token")
  async status(
    @Param("shopKey") shopKey: string, 
    @Param("token") token: string,
    @Query("verify") verify?: string
  ) {
    const shop = await this.shopRepo.findOne({ where: { shopKey } });
    // Do not reveal shop existence - return 404 for both unknown shop and unknown job
    if (!shop) {
      throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    }

    const job = await this.jobRepo.findOne({ where: { token, shopId: shop.id } });
    if (!job) {
      throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    }

    // Check verification if required
    if (shop.requiresVerification) {
      if (!verify) {
        throw new HttpException({ message: "verification_required", error: "Verification required" }, HttpStatus.UNAUTHORIZED);
      }

      // Get last 4 digits from job (either stored or derived from customerContact)
      const last4 = job.customerPhoneLast4 || this.extractPhoneLast4(job.customerContact);
      
      if (!last4 || last4 !== verify.trim()) {
        throw new HttpException({ message: "verification_failed", error: "Invalid verification code" }, HttpStatus.UNAUTHORIZED);
      }
    }

    const state = findState(job.stateKey);
    const flag = findFlag(job.flagKey);

    return {
      shop,
      job: {
        token: job.token,
        vehicleLabel: job.vehicleLabel,
        stateKey: job.stateKey,
        stateLabel: state?.label || job.stateKey,
        stateCustomerBlurb: state?.customerBlurb || "",
        flagKey: job.flagKey,
        flagLabel: flag?.label || job.flagKey,
        flagCustomerBlurb: flag?.customerBlurb || "",
        updatedAt: job.updatedAt,
        active: job.active,
      },
    };
  }

  private extractPhoneLast4(customerContact: string): string | null {
    // Extract last 4 digits from phone number
    // Handles formats like: +1 555-1234, (555) 123-4567, 5551234567, etc.
    const digits = customerContact.replace(/\D/g, '');
    if (digits.length >= 4) {
      return digits.slice(-4);
    }
    return null;
  }
}
