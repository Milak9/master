from .consts import AMINO_ACID_MASSES, AMINO_ACID_BASED_ON_MASSES, MAX_NUMBER_OF_CANDIDATES
from .common_functions import calculate_peptide_mass, score, extend

def linear_spectrum(peptide):
    n = len(peptide)

    prefix_mass = [0 for _ in range(n + 1)]

    for i in range(n):
        amino_acid = peptide[i]
        prefix_mass[i + 1] = prefix_mass[i] + AMINO_ACID_MASSES[amino_acid]

    spectrum = [0]
    spectrum_with_subpeptides = [
        {
            "mass": 0,
            "subpeptide": ""
        }
    ]

    for i in range(n):
        for j in range(i + 1, n + 1):
            fragment_mass = prefix_mass[j] - prefix_mass[i]
            spectrum.append(fragment_mass)
            spectrum_with_subpeptides.append({
                "mass": fragment_mass,
                "subpeptide": peptide[i:j]
            })

    spectrum.sort()
    spectrum_with_subpeptides_sorted = sorted(spectrum_with_subpeptides, key=lambda x: x["mass"])
    return spectrum, spectrum_with_subpeptides_sorted


def cyclic_spectrum(peptide):
    n = len(peptide)

    prefix_mass = [0 for _ in range(n + 1)]

    for i in range(n):
        amino_acid = peptide[i]
        prefix_mass[i + 1] = prefix_mass[i] + AMINO_ACID_MASSES[amino_acid]

    spectrum = [0]
    spectrum_with_subpeptides = [
        {
            "mass": 0,
            "subpeptide": ""
        }
    ]
    peptide_mass = prefix_mass[-1]

    for i in range(n):
        for j in range(i + 1, n + 1):
            fragment_mass = prefix_mass[j] - prefix_mass[i]
            spectrum.append(fragment_mass)
            spectrum_with_subpeptides.append({
                "mass": fragment_mass,
                "subpeptide": peptide[i:j]
            })

            if i > 0 and j < n:
                spectrum.append(peptide_mass - fragment_mass)
                spectrum_with_subpeptides.append({
                    "mass": peptide_mass - fragment_mass,
                    "subpeptide": peptide[j:n] + peptide[0:i]
                })

    spectrum.sort()
    spectrum_with_subpeptides_sorted = sorted(spectrum_with_subpeptides, key=lambda x: x["mass"])
    return spectrum, spectrum_with_subpeptides_sorted


def extend_for_tree(peptides, tree, amino_acid_candidates=AMINO_ACID_MASSES.keys()):
    extended_peptides = []

    for peptide in peptides:
        for amino_acid in amino_acid_candidates:
            if amino_acid != "":
                new_candidate = peptide + amino_acid
                extended_peptides.append(new_candidate)
                tree[new_candidate] = {
                    "node": new_candidate,
                    "children": [],
                    "end": False
                }
                if peptide == "":
                    tree["Root"]["children"].append(new_candidate)
                else:
                    tree[peptide]["children"].append(new_candidate)

    return extended_peptides


def is_consistent_with_spectrum(peptide, target_spectrum):
    peptide_spectrum, _ = linear_spectrum(peptide)

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


def linear_score(peptide, target_spectrum):
    peptide_linear_spectrum, spectrum_with_subpeptides_sorted = linear_spectrum(peptide)
    return score(peptide_linear_spectrum, target_spectrum), spectrum_with_subpeptides_sorted


def cyclic_score(peptide, target_spectrum):
    peptide_cyclic_spectrum, spectrum_with_subpeptides = cyclic_spectrum(peptide)
    return score(peptide_cyclic_spectrum, target_spectrum), spectrum_with_subpeptides


def trim(peptides, target_spectrum, max_number_of_candidates):
    leaderboard = []

    for peptide in peptides:
        peptide_mass = calculate_peptide_mass(peptide)
        peptide_score, spectrum_with_subpeptides_sorted = linear_score(peptide, target_spectrum)
        current_candidate = {
            "peptide": peptide,
            "mass": peptide_mass,
            "number_of_matches": peptide_score,
            "spectrum": spectrum_with_subpeptides_sorted,
            "qualified": False
        }
        leaderboard.append(current_candidate)

    leaderboard = sorted(leaderboard, reverse=True, key=lambda x: x["number_of_matches"])

    if len(peptides) <= max_number_of_candidates:
        leaderboard = [{**item, "qualified": True} for item in leaderboard]
        return peptides, leaderboard

    for i in range(0, max_number_of_candidates):
        leaderboard[i]["qualified"] = True

    for i in range(max_number_of_candidates, len(leaderboard)):
        if leaderboard[i]["number_of_matches"] < leaderboard[max_number_of_candidates - 1]["number_of_matches"]:
            break

    trimmed_leaderboard = leaderboard[:i]
    return [el["peptide"] for el in trimmed_leaderboard], leaderboard


def leaderboard_sequencing(target_spectrum, amino_acid_candidates=AMINO_ACID_MASSES.keys()):
    peptides = ['']

    leaderboard = []
    current_round = 0
    leader_peptide = []
    leader_peptide_score = 0

    target_peptide_mass = target_spectrum[-1]

    while len(peptides) > 0:
        leaderboard.append([])
        extended_peptides = extend(peptides, amino_acid_candidates)

        consistent_peptides = []
        potential_candidates = []
        for peptide in extended_peptides:
            peptide_mass = calculate_peptide_mass(peptide)
            peptide_score, spectrum_with_subpeptides_sorted = cyclic_score(peptide, target_spectrum)

            current_candidate = {
                "peptide": peptide,
                "mass": peptide_mass,
                "number_of_matches": peptide_score,
                "spectrum": spectrum_with_subpeptides_sorted,
                "candidate": False,
                "qualified": False
            }

            if peptide_mass == target_peptide_mass:
                current_candidate["candidate"]: True
                current_candidate["reason"] = "Masa je jednaka traženoj masi, ovaj peptid je kandidat za rešenje."
                potential_candidates.append(current_candidate)
                if peptide_score > leader_peptide_score:
                    leader_peptide = [current_candidate]
                    leader_peptide_score = peptide_score
                elif peptide_score == leader_peptide_score:
                    leader_peptide.append(current_candidate)

            elif peptide_mass < target_peptide_mass:
                consistent_peptides.append(peptide)
            else:
                current_candidate["reason"] = "Nije rešenje jer je masa veća od tražene mase"
                potential_candidates.append(current_candidate)

        peptides, current_round_peptides = trim(consistent_peptides, target_spectrum, MAX_NUMBER_OF_CANDIDATES)
        current_round_peptides = current_round_peptides + potential_candidates
        leaderboard[current_round] = sorted(current_round_peptides, reverse=True, key=lambda x: x["number_of_matches"])
        current_round += 1

    response = {
        "leaderboard": leaderboard,
        "solution": leader_peptide,
        "N": MAX_NUMBER_OF_CANDIDATES
    }
    return response
