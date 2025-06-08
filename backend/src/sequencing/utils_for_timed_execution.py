from .common_functions import calculate_peptide_mass, score, extend, prepare_amino_acids_that_are_candidates
from .consts import AMINO_ACID_MASSES, MAX_NUMBER_OF_CANDIDATES


def linear_spectrum(peptide):
    n = len(peptide)

    prefix_mass = [0 for _ in range(n + 1)]

    for i in range(n):
        amino_acid = peptide[i]
        prefix_mass[i + 1] = prefix_mass[i] + AMINO_ACID_MASSES[amino_acid]

    spectrum = [0]

    for i in range(n):
        for j in range(i + 1, n + 1):
            fragment_mass = prefix_mass[j] - prefix_mass[i]
            spectrum.append(fragment_mass)

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


def linear_score(peptide, target_spectrum):
    peptide_linear_spectrum = linear_spectrum(peptide)
    return score(peptide_linear_spectrum, target_spectrum)


def cyclic_score(peptide, target_spectrum):
    peptide_cyclic_spectrum = cyclic_spectrum(peptide)
    return score(peptide_cyclic_spectrum, target_spectrum)


def trim(peptides, target_spectrum, max_number_of_candidates):
    if len(peptides) <= max_number_of_candidates:
        return peptides

    leaderboard = []

    for peptide in peptides:
        peptide_score = linear_score(peptide, target_spectrum)
        leaderboard.append((peptide_score, peptide))

    leaderboard.sort(reverse=True)

    for i in range(max_number_of_candidates, len(leaderboard)):
        if leaderboard[i][0] < leaderboard[max_number_of_candidates - 1][0]:
            break

    trimmed_leaderboard = leaderboard[:i]
    return [el[1] for el in trimmed_leaderboard]


def is_consistent_with_spectrum(peptide, target_spectrum):
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


def leaderboard_sequencing_without_additional_data(target_spectrum, amino_acid_candidates=AMINO_ACID_MASSES.keys()):
    peptides = ['']

    leader_peptide = []
    leader_peptide_score = 0

    target_peptide_mass = target_spectrum[-1]

    while len(peptides) > 0:
        extended_peptides = extend(peptides, amino_acid_candidates)

        consistent_peptides = []
        for peptide in extended_peptides:
            peptide_mass = calculate_peptide_mass(peptide)

            if peptide_mass == target_peptide_mass:
                peptide_score = cyclic_score(peptide, target_spectrum)

                current_candidate = {
                    "peptide": peptide,
                    "mass": peptide_mass,
                    "number_of_matches": peptide_score
                }

                if peptide_score > leader_peptide_score:
                    leader_peptide = [current_candidate]
                    leader_peptide_score = peptide_score
                elif peptide_score == leader_peptide_score:
                    leader_peptide.append(current_candidate)

            elif peptide_mass < target_peptide_mass:
                consistent_peptides.append(peptide)

        peptides = trim(consistent_peptides, target_spectrum, MAX_NUMBER_OF_CANDIDATES)

    return {
        "solution": leader_peptide
    }


def convolution_sequencing(target_spectrum, number_of_largest_elements):
    convolution = []
    for i in range(len(target_spectrum)):
        for j in range(i):
            diff = target_spectrum[i] - target_spectrum[j]
            if 57 <= diff <= 200:
                convolution.append(diff)

    freq_dict = {}
    for mass in convolution:
        if mass in freq_dict:
            freq_dict[mass] += 1
        else:
            freq_dict[mass] = 1

    sorted_masses = sorted(freq_dict.items(), key=lambda x: x[1], reverse=True)
    if number_of_largest_elements > len(sorted_masses):
        top_masses = [mass for mass, _ in sorted_masses]
    else:
        number_of_showing = sorted_masses[number_of_largest_elements - 1][1]
        top_masses = [mass for mass, num in sorted_masses if number_of_showing <= num]

    amino_acid_candidates = prepare_amino_acids_that_are_candidates(top_masses)
    return leaderboard_sequencing_without_additional_data(target_spectrum, amino_acid_candidates)


def brute_force_sequencing(target_spectrum):
    peptides = ['']
    target_peptide_mass = target_spectrum[-1]
    solution = []

    while len(peptides) > 0:
        extended_peptides = extend(peptides)

        candidates = []

        for peptide in extended_peptides:
            peptide_mass = calculate_peptide_mass(peptide)
            if peptide_mass == target_peptide_mass:
                calculated_spectrum = cyclic_spectrum(peptide)
                if calculated_spectrum == target_spectrum:
                    solution.append(peptide)
            elif peptide_mass < target_peptide_mass:
                candidates.append(peptide)

        peptides = candidates

    return {
        "solution": solution
    }


def branch_and_bound_sequencing(target_spectrum):
    peptides = ['']
    target_peptide_mass = target_spectrum[-1]
    solution = []

    while len(peptides) > 0:
        extended_peptides = extend(peptides)

        consistent_peptides = []

        for peptide in extended_peptides:
            peptide_mass = calculate_peptide_mass(peptide)

            if peptide_mass == target_peptide_mass:
                calculated_spectrum = cyclic_spectrum(peptide)
                if calculated_spectrum == target_spectrum:
                    solution.append(peptide)
            elif peptide_mass < target_peptide_mass:
                if is_consistent_with_spectrum(peptide, target_spectrum):
                    consistent_peptides.append(peptide)
        peptides = consistent_peptides

    return {
        "solution": solution
    }
