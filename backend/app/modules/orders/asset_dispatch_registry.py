from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class DispatchSkillPacket:
    asset_label: str
    intervention_label: str
    task_label: str
    skill_label: str
    required_people: int
    esco_codes: list[str] = field(default_factory=list)
    nace_codes: list[str] = field(default_factory=list)
    required_certification_codes: list[str] = field(default_factory=list)
    standard_consumables: list[str] = field(default_factory=list)


SERVICE_DISPATCH_MATRIX: dict[str, dict[str, DispatchSkillPacket]] = {
    "reparat-calorifer": {
        "Reparatie": DispatchSkillPacket(
            asset_label="Calorifer",
            intervention_label="Reparatie",
            task_label="Diagnoza si remediere defect",
            skill_label="Tehnician diagnoza",
            required_people=1,
            esco_codes=["ESCO-HVAC-DIAG"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH"],
            standard_consumables=["Garnituri radiator", "Ventil aerisire", "Etansant instalatii"],
        ),
        "Mentenanta": DispatchSkillPacket(
            asset_label="Calorifer",
            intervention_label="Mentenanta",
            task_label="Revizie si reglaj",
            skill_label="Tehnician service",
            required_people=1,
            esco_codes=["ESCO-HVAC-MAINT"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH"],
            standard_consumables=["Cheie aerisire", "Solutie anticoroziva"],
        ),
        "Inlocuire": DispatchSkillPacket(
            asset_label="Calorifer",
            intervention_label="Inlocuire",
            task_label="Demontare + inlocuire componenta",
            skill_label="Echipa instalare",
            required_people=2,
            esco_codes=["ESCO-HVAC-REMOVE", "ESCO-HVAC-INSTALL"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH"],
            standard_consumables=["Robineti radiator", "Console montaj", "Kit racord"],
        ),
        "Montaj": DispatchSkillPacket(
            asset_label="Calorifer",
            intervention_label="Montaj",
            task_label="Montaj corp nou",
            skill_label="Echipa instalare",
            required_people=2,
            esco_codes=["ESCO-HVAC-INSTALL"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH"],
            standard_consumables=["Console montaj", "Racorduri flexibile", "Kit punere in functiune"],
        ),
    },
    "montaj-centrala-termica": {
        "Reparatie": DispatchSkillPacket(
            asset_label="Centrala termica",
            intervention_label="Reparatie",
            task_label="Diagnoza si remediere defect",
            skill_label="Tehnician diagnoza",
            required_people=1,
            esco_codes=["ESCO-HVAC-DIAG"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH"],
            standard_consumables=["Electrozi aprindere", "Senzori presiune", "Kit diagnoza"],
        ),
        "Mentenanta": DispatchSkillPacket(
            asset_label="Centrala termica",
            intervention_label="Mentenanta",
            task_label="Revizie anuala / VTP",
            skill_label="Tehnician revizie",
            required_people=1,
            esco_codes=["ESCO-HVAC-MAINT"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH"],
            standard_consumables=["Filtru impuritati", "Kit curatare schimbator", "Garnituri service"],
        ),
        "Inlocuire": DispatchSkillPacket(
            asset_label="Centrala termica",
            intervention_label="Inlocuire",
            task_label="Demontare unitate veche + montaj nou",
            skill_label="Echipa instalare",
            required_people=2,
            esco_codes=["ESCO-HVAC-REMOVE", "ESCO-HVAC-INSTALL"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH", "ISCIR_AUTH"],
            standard_consumables=["Kit evacuare", "Racord gaz certificat", "Filtru magnetic", "Consola montaj"],
        ),
        "Montaj": DispatchSkillPacket(
            asset_label="Centrala termica",
            intervention_label="Montaj",
            task_label="Montaj unitate noua",
            skill_label="Echipa instalare",
            required_people=2,
            esco_codes=["ESCO-HVAC-INSTALL"],
            nace_codes=["4322"],
            required_certification_codes=["GAS_AUTH", "ISCIR_AUTH"],
            standard_consumables=["Kit evacuare", "Racord gaz certificat", "Termostat ambient", "Filtru magnetic"],
        ),
    },
}


def resolve_dispatch_skill_packet(service_slug: str, intervention_label: str | None = None) -> DispatchSkillPacket | None:
    interventions = SERVICE_DISPATCH_MATRIX.get((service_slug or "").lower())
    if not interventions:
        return None
    if intervention_label and intervention_label in interventions:
        return interventions[intervention_label]
    return next(iter(interventions.values()))
