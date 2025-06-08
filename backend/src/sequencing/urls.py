from django.urls import path
from .views import BruteForce, BranchAndBound, Leaderboard, SpectralConvolution, TimedExecutions

urlpatterns = [
    path('brute_force/', BruteForce.as_view(), name='brute_force'),
    path('branch_and_bound/', BranchAndBound.as_view(), name='branch_and_bound'),
    path('leaderboard/', Leaderboard.as_view(), name='leaderboard'),
    path('spectral_convolution/', SpectralConvolution.as_view(), name='spectral_convolution'),
    path('timed_executions/', TimedExecutions.as_view(), name='timed_executions'),
]
