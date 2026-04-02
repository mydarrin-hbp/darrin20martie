from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpiredJobSummary(BaseModel):
    order_ref: str
    service_name: str
    locality_slug: str | None = None
    missing_skill_label: str
    expired_at: datetime | None = None


class PublicOrderCreateRequest(BaseModel):
    slug: str
    target_address: str = Field(min_length=3, max_length=255)
    requested_quantity: float | None = Field(default=None, gt=0)
    place_id: str | None = None
    urgency: bool = False
    intervention_label: str | None = None
    task_label: str | None = None
    skill_label: str | None = None
    required_people: int | None = Field(default=None, gt=0)
    esco_codes: list[str] = Field(default_factory=list)
    nace_codes: list[str] = Field(default_factory=list)
    required_certification_codes: list[str] = Field(default_factory=list)
    standard_consumables: list[str] = Field(default_factory=list)
    escrow_retention: float | None = Field(default=None, ge=0)


class PublicOrderResponse(BaseModel):
    order_ref: str
    slug: str
    status: str
    target_address: str
    country_code: str
    zone_slug: str
    locality_slug: str | None = None
    requested_quantity: float | None = None
    asset_label: str | None = None
    intervention_label: str | None = None
    task_label: str | None = None
    skill_label: str | None = None
    required_people: int | None = None
    esco_codes: list[str] = Field(default_factory=list)
    nace_codes: list[str] = Field(default_factory=list)
    required_certification_codes: list[str] = Field(default_factory=list)
    standard_consumables: list[str] = Field(default_factory=list)
    currency: str
    currency_symbol: str | None = None
    minimum_order_applied: bool = False
    cost_direct: float
    cost_regie: float
    mentenanta_platforma: float
    venit_platforma: float
    garantie_buna_executie: float
    insurance_premium: float
    darrin_management_fee: float
    tva: float
    total_facturabil: float
    deviz_draft_id: int | None = None
    created_at: datetime


class ProjectedRevenueMetricResponse(BaseModel):
    projected_revenue_total: float
    projected_order_count: int
    currency: str
    statuses: list[str]
    full_package_claim_rate_60s: float = 0.0
    expired_job_count: int = 0
    expired_jobs: list[ExpiredJobSummary] = Field(default_factory=list)


class PublicLiveActivityItem(BaseModel):
    order_ref: str
    service_name: str
    locality_slug: str | None = None
    status: str
    finished_at: datetime | None = None
    message: str


class PublicLiveActivityResponse(BaseModel):
    items: list[PublicLiveActivityItem] = Field(default_factory=list)


class OrderDocumentResponse(BaseModel):
    id: int
    order_id: int
    document_type: str
    status: str
    mime_type: str
    storage_key: str
    file_name: str
    placeholder_content: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderReviewResponse(BaseModel):
    id: int
    order_ref: str
    rating: int
    feedback: str
    is_visible: bool
    admin_note: str | None = None
    created_at: datetime


class OrderReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    feedback: str = Field(min_length=3, max_length=1000)


class OrderReviewAdminUpdateRequest(BaseModel):
    is_visible: bool | None = None
    admin_note: str | None = Field(default=None, max_length=1000)


class AdminOrderReviewResponse(BaseModel):
    id: int
    order_ref: str
    rating: int
    feedback: str
    is_visible: bool
    admin_note: str | None = None
    client_name: str | None = None
    client_email: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QualityDocumentsReleaseRequest(BaseModel):
    quality_document_note: str = Field(min_length=3, max_length=500)


class OrderBroadcastResponse(BaseModel):
    id: int
    order_id: int
    supplier_id: int
    task_scope: str
    claim_status: str
    can_cover_full_package: bool
    locality_slug: str | None = None
    priority_expires_at: datetime | None = None
    claimed_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderBroadcastClaimRequest(BaseModel):
    supplier_id: int = Field(gt=0)


class PartnerLiveJobResponse(BaseModel):
    broadcast_id: int
    supplier_id: int
    order_id: int
    order_ref: str
    service_slug: str
    service_name: str
    asset_label: str | None = None
    intervention_label: str | None = None
    task_label: str | None = None
    skill_label: str | None = None
    required_people: int | None = None
    esco_codes: list[str] = Field(default_factory=list)
    nace_codes: list[str] = Field(default_factory=list)
    required_certification_codes: list[str] = Field(default_factory=list)
    standard_consumables: list[str] = Field(default_factory=list)
    target_address: str
    locality_slug: str | None = None
    claim_status: str
    full_package_priority_seconds: int = 0
    can_cover_full_package: bool = False
    client_gross_total: float
    mydarrin_retention: float
    escrow_retention: float
    insurance_fee: float
    partner_net_receivable: float
    can_claim: bool
    blocking_reasons: list[str] = Field(default_factory=list)


class AdminOrderSummary(BaseModel):
    id: int
    order_ref: str
    status: str
    service_name: str
    total_facturabil: float
    currency: str
    target_address: str
    locality_slug: str | None = None
    client_email: str | None = None
    client_name: str | None = None
    provider_ref: str | None = None
    provider_name: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class AdminOrderDetail(AdminOrderSummary):
    cost_direct: float
    cost_regie: float
    mentenanta_platforma: float
    venit_platforma: float
    garantie_buna_executie: float
    insurance_premium: float
    darrin_management_fee: float
    tva: float
    escrow_status: str
    escrow_blocked_amount: float
    asset_label: str | None = None
    intervention_label: str | None = None
    task_label: str | None = None
    skill_label: str | None = None
    required_people: int | None = None


class ClientOrderSummary(BaseModel):
    order_ref: str
    status: str
    service_name: str
    total_facturabil: float
    currency: str
    target_address: str
    locality_slug: str | None = None
    provider_ref: str | None = None
    provider_name: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class ClientOrderDetail(ClientOrderSummary):
    cost_direct: float
    cost_regie: float
    mentenanta_platforma: float
    venit_platforma: float
    garantie_buna_executie: float
    insurance_premium: float
    darrin_management_fee: float
    tva: float
    escrow_status: str
    escrow_blocked_amount: float
    asset_label: str | None = None
    intervention_label: str | None = None
    task_label: str | None = None
    skill_label: str | None = None
    required_people: int | None = None


class OrderStatusUpdateRequest(BaseModel):
    status: str
    provider_ref: str | None = None
    provider_name: str | None = None
    message: str | None = None


class OrderAssignRequest(BaseModel):
    provider_ref: str | None = None
    provider_name: str | None = None
