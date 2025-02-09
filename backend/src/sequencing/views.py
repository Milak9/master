import heapq
from collections import Counter

from django.views.generic.base import View
from django.http import JsonResponse
from utils import (calculate_peptide_mass, cyclic_spectrum, consistent, extend, leaderboard_sequencing,
                   prepare_amino_acids_that_are_candidates)
import numpy as np


class BruteForce(View):

    @classmethod
    def post(cls, request):
        target_spectrum = request.body.target_spectrum
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

        return results


class BranchAndBound(View):

    @classmethod
    def post(cls, request):
        target_spectrum = request.body.target_spectrum
        peptides = ['']
        results = []

        target_peptide_mass = target_spectrum[-1]

        while len(peptides) > 0:
            extended_peptides = extend(peptides)

            consistent_peptides = []

            for peptide in extended_peptides:
                if calculate_peptide_mass(peptide) == target_peptide_mass:
                    if cyclic_spectrum(peptide) == target_spectrum:
                        results.append(peptide)
                else:
                    if consistent(peptide, target_spectrum):
                        consistent_peptides.append(peptide)

            peptides = consistent_peptides

        return results


class Leaderboard(View):

    @classmethod
    def post(cls, request):
        target_spectrum = request.body.target_spectrum

        leader_peptide, tree = leaderboard_sequencing(target_spectrum)
        response = {
            "leader_peptide": leader_peptide,
            "tree": tree
        }

        return JsonResponse({response}, status=200)


class SpectralConvolution(View):
    NUMBER_OF_LARGEST_ELEMENTS = 20

    @classmethod
    def post(cls, request):
        target_spectrum = request.body.target_spectrum
        num_of_el_in_spectrum = len(target_spectrum)
        convolution_matrix = np.zeros((num_of_el_in_spectrum, num_of_el_in_spectrum - 1))

        for i in range(num_of_el_in_spectrum):
            for j in range(num_of_el_in_spectrum):
                difference = abs(target_spectrum[i] - target_spectrum[j])
                if difference == 0:
                    break
                convolution_matrix[i][j] = difference

        flattened_matrix = convolution_matrix.flatten()
        non_zero_elements = [element for element in flattened_matrix if element != 0]
        element_counts = Counter(non_zero_elements)
        most_common_elements = heapq.nlargest(cls.NUMBER_OF_LARGEST_ELEMENTS, element_counts.items(), key=lambda x: x[1])

        amino_acid_candidates = prepare_amino_acids_that_are_candidates(most_common_elements)
        leader_peptide, tree = leaderboard_sequencing(target_spectrum, amino_acid_candidates)

        response = {
            "most_common_elements": most_common_elements,
            "amino_acid_candidates": amino_acid_candidates,
            "leader_peptide": leader_peptide,
            "tree": tree
        }

        return JsonResponse({response}, status=200)
