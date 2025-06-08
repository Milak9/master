from json import loads

from django.utils.decorators import method_decorator
from django.views.generic.base import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import (calculate_peptide_mass, cyclic_spectrum, is_consistent_with_spectrum, extend_for_tree,
                    leaderboard_sequencing)
from .utils_for_timed_execution import (brute_force_sequencing, branch_and_bound_sequencing,
                                        leaderboard_sequencing_without_additional_data, convolution_sequencing)
from .common_functions import prepare_amino_acids_that_are_candidates
import timeit


@method_decorator(csrf_exempt, name='dispatch')
class BruteForce(View):

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")
        peptides = ['']
        results = {}
        target_peptide_mass = target_spectrum[-1]
        tree = {
            "Root": {
                "node": "Root",
                "mass": 0,
                "children": [],
                "end": False
            }
        }

        solution = []
        while len(peptides) > 0:
            extended_peptides = extend_for_tree(peptides, tree)

            candidates = []

            for peptide in extended_peptides:
                peptide_mass = calculate_peptide_mass(peptide)
                tree[peptide]["mass"] = peptide_mass
                if peptide_mass == target_peptide_mass:
                    tree[peptide]["end"] = True
                    calculated_spectrum, spectrum_with_masses = cyclic_spectrum(peptide)
                    if calculated_spectrum == target_spectrum:
                        results[peptide] = spectrum_with_masses
                        solution.append(peptide)
                elif peptide_mass < target_peptide_mass:
                    candidates.append(peptide)
                else:
                    tree[peptide]["end"] = True

            peptides = candidates

        response = {
            "candidates": results,
            "tree": tree,
            "solution": solution
        }
        return JsonResponse(response, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class BranchAndBound(View):

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")
        peptides = ['']
        results = {}
        tree = {
            "Root": {
                "node": "Root",
                "mass": 0,
                "children": [],
                "end": False,
                "candidate": False
            }
        }

        target_peptide_mass = target_spectrum[-1]
        solution = []

        while len(peptides) > 0:
            extended_peptides = extend_for_tree(peptides, tree)

            consistent_peptides = []

            for peptide in extended_peptides:
                peptide_mass = calculate_peptide_mass(peptide)
                tree[peptide]["mass"] = peptide_mass
                if peptide_mass == target_peptide_mass:
                    tree[peptide]["end"] = True
                    calculated_spectrum, spectrum_with_masses = cyclic_spectrum(peptide)
                    if calculated_spectrum == target_spectrum:
                        results[peptide] = spectrum_with_masses
                        tree[peptide]["candidate"] = True
                        solution.append(peptide)
                    else:
                        tree[peptide]["candidate"] = False
                elif peptide_mass < target_peptide_mass:
                    if is_consistent_with_spectrum(peptide, target_spectrum):
                        consistent_peptides.append(peptide)
                    else:
                        tree[peptide]["end"] = True
                        tree[peptide]["candidate"] = False
                        tree[peptide]["reason"] = "Teorijski spektar peptida nije konzistentan sa zadatim spektrom."
                else:
                    tree[peptide]["end"] = True
                    tree[peptide]["candidate"] = False
                    tree[peptide]["reason"] = "Peptid ima preveliku masu i ne može biti rešenje."

            peptides = consistent_peptides

        response = {
            "candidates": results,
            "tree": tree,
            "solution": solution
        }
        return JsonResponse(response, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class Leaderboard(View):

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")

        response = leaderboard_sequencing(target_spectrum)
        return JsonResponse(response, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class SpectralConvolution(View):
    NUMBER_OF_LARGEST_ELEMENTS = 20

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")
        num_of_el_in_spectrum = len(target_spectrum)
        convolution = []

        for i in range(num_of_el_in_spectrum):
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
        if cls.NUMBER_OF_LARGEST_ELEMENTS > len(sorted_masses):
            top_masses = [mass for mass, _ in sorted_masses]
        else:
            number_of_showing = sorted_masses[cls.NUMBER_OF_LARGEST_ELEMENTS - 1][1]
            top_masses = [mass for mass, num in sorted_masses if number_of_showing <= num]

        amino_acid_candidates = prepare_amino_acids_that_are_candidates(top_masses)
        leaderboard_response = leaderboard_sequencing(target_spectrum, amino_acid_candidates)

        response = {
            "amino_acids_in_peptides": sorted_masses,
            "top": top_masses,
            "amino_acid_candidates": amino_acid_candidates,
            "leaderboard": leaderboard_response["leaderboard"],
            "solution": leaderboard_response["solution"],
            "N": leaderboard_response["N"],
            "M": cls.NUMBER_OF_LARGEST_ELEMENTS
        }

        return JsonResponse(response, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class TimedExecutions(View):
    NUMBER_OF_LARGEST_ELEMENTS = 20

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")

        # BRUTE FORCE
        start_brute_force = timeit.default_timer()
        brute_force = brute_force_sequencing(target_spectrum)
        end_brute_force = timeit.default_timer()
        elapsed_time_brute_force = end_brute_force - start_brute_force
        brute_force["execution_time"] = f"{elapsed_time_brute_force:.4f}"

        # BRANCH AND BOUND
        start_branch_and_bound = timeit.default_timer()
        branch_and_bound = branch_and_bound_sequencing(target_spectrum)
        end_branch_and_bound = timeit.default_timer()
        elapsed_time_branch_and_bound = end_branch_and_bound - start_branch_and_bound
        branch_and_bound["execution_time"] = f"{elapsed_time_branch_and_bound:.4f}"

        # LEADERBOARD
        start_leaderboard = timeit.default_timer()
        leaderboard = leaderboard_sequencing_without_additional_data(target_spectrum)
        end_leaderboard = timeit.default_timer()
        elapsed_time_leaderboard = end_leaderboard - start_leaderboard
        leaderboard["execution_time"] = f"{elapsed_time_leaderboard:.4f}"

        # CONVOLUTION
        start_convolution = timeit.default_timer()
        convolution = convolution_sequencing(target_spectrum, cls.NUMBER_OF_LARGEST_ELEMENTS)
        end_convolution = timeit.default_timer()
        elapsed_time_convolution = end_convolution - start_convolution
        convolution["execution_time"] = f"{elapsed_time_convolution:.4f}"

        response = {
            "brute_force": brute_force,
            "bnb": branch_and_bound,
            "leaderboard": leaderboard,
            "convolution": convolution
        }
        return JsonResponse(response, status=200)
