from consts import AMINO_ACID_MASSES, AMINO_ACID_BASED_ON_MASSES, MAX_NUMBER_OF_CANDIDATES


def linear_spectrum(peptide):
    n = len(peptide)

    prefix_mass = [0 for _ in range(n + 1)]

    for i in range(n):
        amino_acid = peptide[i]
        prefix_mass[i + 1] = prefix_mass[i] + AMINO_ACID_MASSES[amino_acid]

    spectrum = [0]

    for i in range(n):
        for j in range(i + 1, n + 1):
            spectrum.append(prefix_mass[j] - prefix_mass[i])

    spectrum.sort()
    return spectrum


def cyclic_spectrum(peptide):
    n = len(peptide)

    prefix_mass = [0 for _ in range(n + 1)]

    for i in range(n):
        amino_acid = peptide[i]
        prefix_mass[i + 1] = prefix_mass[i] + AMINO_ACID_MASSES[amino_acid]

    spectrum = [0]
    peptide_mass = prefix_mass[-1]

    for i in range(n):
        for j in range(i + 1, n + 1):
            fragment_mass = prefix_mass[j] - prefix_mass[i]
            spectrum.append(fragment_mass)

            if i > 0 and j < n:
                spectrum.append(peptide_mass - fragment_mass)

    spectrum.sort()
    return spectrum


def extend(peptides, amino_acid_candidates):
    extended_peptides = []

    for peptide in peptides:
        for amino_acid in amino_acid_candidates:
            if amino_acid != "":
                extended_peptides.append(peptide + amino_acid)

    return extended_peptides


def calculate_peptide_mass(peptide):
    total_mass = 0

    for aa in peptide:
        total_mass += AMINO_ACID_MASSES[aa]

    return total_mass


def consistent(peptide, target_spectrum):
    peptide_spectrum = linear_spectrum(peptide)

    i = 0
    j = 0
    n = len(peptide_spectrum)
    m = len(target_spectrum)

    while i < n and j < m:
        if peptide_spectrum[i] == target_spectrum[j]:
            i += 1
            j += 1
        elif peptide_spectrum[i] > target_spectrum[j]:
            j += 1
        else:
            return False

    if i < n:
        return False
    else:
        return True


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


def linear_score(peptide, target_spectrum):
    peptide_linear_spectrum = linear_spectrum(peptide)
    return score(peptide_linear_spectrum, target_spectrum)


def cyclic_score(peptide, target_spectrum):
    peptide_cyclic_spectrum = cyclic_spectrum(peptide)
    return score(peptide_cyclic_spectrum, target_spectrum)


def trim(peptides, target_spectrum, max_number_of_elements):
    if len(peptides) <= max_number_of_elements:
        return peptides

    leaderboard = []

    for peptide in peptides:
        peptide_score = linear_score(peptide, target_spectrum)
        leaderboard.append((peptide_score, peptide))
    leaderboard.sort(reverse=True)

    for i in range(max_number_of_elements, len(leaderboard)):
        if leaderboard[i][0] < leaderboard[max_number_of_elements - 1][0]:
            break

    trimmed_leaderboard = leaderboard[:i]
    return [el[1] for el in trimmed_leaderboard]


def prepare_amino_acids_that_are_candidates(elements_with_number_of_appearances):
    candidates = ['']
    for element, _ in elements_with_number_of_appearances:
        candidates = candidates + AMINO_ACID_BASED_ON_MASSES[element]

    return candidates


def leaderboard_sequencing(target_spectrum, amino_acid_candidates=AMINO_ACID_MASSES.keys()):
    peptides = ['']

    leader_peptide = ''
    leader_peptide_score = 0

    target_peptide_mass = target_spectrum[-1]

    while len(peptides) > 0:
        extended_peptides = extend(peptides, amino_acid_candidates)

        consistent_peptides = []

        for peptide in extended_peptides:
            if calculate_peptide_mass(peptide) == target_peptide_mass:
                peptide_score = cyclic_score(peptide, target_spectrum)
                if peptide_score > leader_peptide_score:
                    leader_peptide = peptide
                    leader_peptide_score = peptide_score
            elif calculate_peptide_mass(peptide) < target_peptide_mass:
                consistent_peptides.append(peptide)

        peptides = trim(consistent_peptides, target_spectrum, MAX_NUMBER_OF_CANDIDATES)

    return leader_peptide, tree
