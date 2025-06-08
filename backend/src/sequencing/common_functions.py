from .consts import AMINO_ACID_MASSES, AMINO_ACID_BASED_ON_MASSES


def calculate_peptide_mass(peptide):
    total_mass = 0

    for aa in peptide:
        total_mass += AMINO_ACID_MASSES[aa]

    return total_mass


def score(peptide_spectrum, target_spectrum):
    total_score = 0

    i = 0
    j = 0
    n = len(peptide_spectrum)
    m = len(target_spectrum)

    while i < n and j < m:
        if peptide_spectrum[i] == target_spectrum[j]:
            i += 1
            j += 1
            total_score += 1
        elif peptide_spectrum[i] > target_spectrum[j]:
            j += 1
        else:
            i += 1

    return total_score


def extend(peptides, amino_acid_candidates=AMINO_ACID_MASSES.keys()):
    extended_peptides = []

    for peptide in peptides:
        for amino_acid in amino_acid_candidates:
            if amino_acid != "":
                extended_peptides.append(peptide + amino_acid)

    return extended_peptides


def prepare_amino_acids_that_are_candidates(top_masses):
    candidates = ['']
    for element in top_masses:
        if element in AMINO_ACID_BASED_ON_MASSES:
            candidates = candidates + AMINO_ACID_BASED_ON_MASSES[element]

    return candidates
