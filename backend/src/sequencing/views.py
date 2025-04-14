from json import loads

from django.utils.decorators import method_decorator
from django.views.generic.base import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import (calculate_peptide_mass, cyclic_spectrum, is_consistent_with_spectrum, extend_for_tree,
                    leaderboard_sequencing, prepare_amino_acids_that_are_candidates)


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
                "mass": 0,
                "children": [],
                "end": False
            }
        }

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
                elif peptide_mass < target_peptide_mass:
                    candidates.append(peptide)
                else:
                    tree[peptide]["end"] = True

            peptides = candidates

        response = {
            "candidates": results,
            "tree": tree
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
