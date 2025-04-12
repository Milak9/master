from json import loads

from django.utils.decorators import method_decorator
from django.views.generic.base import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import (calculate_peptide_mass, cyclic_spectrum, is_consistent_with_spectrum, extend, leaderboard_sequencing,
                   prepare_amino_acids_that_are_candidates)


@method_decorator(csrf_exempt, name='dispatch')
class BruteForce(View):

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")
        peptides = ['']
        results = []
        target_peptide_mass = target_spectrum[-1]

        while len(peptides) > 0:
            extended_peptides = extend(peptides)

            candidates = []

            for peptide in extended_peptides:
                peptide_mass = calculate_peptide_mass(peptide)
                if peptide_mass == target_peptide_mass:
                    if cyclic_spectrum(peptide) == target_spectrum:
                        results.append(peptide)
                elif peptide_mass < target_peptide_mass:
                    candidates.append(peptide)

            peptides = candidates

        return JsonResponse({"results": results}, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class BranchAndBound(View):

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")
        peptides = ['']
        results = []

        target_peptide_mass = target_spectrum[-1]

        while len(peptides) > 0:
            extended_peptides = extend(peptides)

            consistent_peptides = []

            for peptide in extended_peptides:
                peptide_mass = calculate_peptide_mass(peptide)
                if peptide_mass == target_peptide_mass:
                    if cyclic_spectrum(peptide) == target_spectrum:
                        results.append(peptide)
                elif peptide_mass < target_peptide_mass:
                    if is_consistent_with_spectrum(peptide, target_spectrum):
                        consistent_peptides.append(peptide)

            peptides = consistent_peptides

        return JsonResponse({"results": results}, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class Leaderboard(View):

    @classmethod
    def post(cls, request):
        target_spectrum = loads(request.body).get("target_spectrum")

        leader_peptide, tree = leaderboard_sequencing(target_spectrum)
        response = {
            "leader_peptide": leader_peptide,
            "tree": tree
        }

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
        leader_peptide, tree = leaderboard_sequencing(target_spectrum, amino_acid_candidates)

        response = {
            "most_common_elements": sorted_masses,
            "top": top_masses,
            "amino_acid_candidates": amino_acid_candidates,
            "leader_peptide": leader_peptide,
            "tree": tree
        }

        return JsonResponse(response, status=200)
