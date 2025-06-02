"use client"

import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

export default function LiteraturaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Literatura</h1>

      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-muted-foreground mb-6">
          Ova stranica sadrži listu referenci i naučnih radova koji su korišćeni kao osnova za algoritme i metode
          prikazane u ovoj aplikaciji. Ovi radovi pružaju detaljnije informacije o teorijskim osnovama i praktičnim
          primenama algoritama za sekvenciranje peptida.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Algoritmi za sekvenciranje peptida</h2>
          <ul className="space-y-4">
            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="1">[1]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Bioinformatics Algorithms: An Active Learning Approach Vol. I</p>
                  <p className="text-sm text-muted-foreground">Philip Compeau, Pavel Pevzner (2015)</p>
                  <p className="text-sm text-muted-foreground">Chapter 4: How Do We Sequence Antibiotics?, 182-221</p>
                </div>
                <a
                  href="https://cogniterra.org/course/64/promo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Link</span>
                </a>
              </div>
            </li>

            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="2">[2]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Materijal sa predavanja "Uvod u bioinformatiku"</p>
                  <p className="text-sm text-muted-foreground">Jovana Kovačević (2022)</p>
                </div>
                <a
                  href="https://www.bioinformatika.matf.bg.ac.rs/predavanja/Chapter_4.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Link</span>
                </a>
              </div>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">De Novo tehnike za sekvenciranje peptida</h2>
          <ul className="space-y-4">
            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="3">[3]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">DeepNovo: De novo peptide sequencing by deep learning</p>
                  <p className="text-sm text-muted-foreground">
                    Ngoc Hieu Tran, Xianglilan Zhang, Lei Xin, Baozhen Shan, Ming Li (2017)
                  </p>
                  <p className="text-sm text-muted-foreground">PNAS, 114 (31), 8247-8252</p>
                </div>
                <a
                  href="https://doi.org/10.1073/pnas.1705691114"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>DOI</span>
                </a>
              </div>
            </li>

            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="4">[4]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    PEAKS DB: De Novo Sequencing Assisted Database Search for Sensitive and Accurate Peptide
                    Identification
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Jing Zhang, Lei Xin, Baozhen Shan, Weiwu Chen, Mingjie Xie, Denis Yuen, Weiming Zhang, Zefeng Zhang,
                    Gilles A. Lajoie Bin Ma (2011)
                  </p>
                  <p className="text-sm text-muted-foreground">Molecular & Cellular Proteomics, 11 (4)</p>
                </div>
                <a
                  href="https://doi.org/10.1074/mcp.M111.010587"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>DOI</span>
                </a>
              </div>
            </li>

            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="5">[5]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Novor: Real-Time Peptide de Novo Sequencing Software</p>
                  <p className="text-sm text-muted-foreground">Bin Ma (2015)</p>
                  <p className="text-sm text-muted-foreground">
                    Journal of The American Society for Mass Spectrometry, 26 (11), 1885-1894
                  </p>
                </div>
                <a
                  href="https://doi.org/10.1007/s13361-015-1204-0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>DOI</span>
                </a>
              </div>
            </li>

            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="6">[6]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    PepNovo:  De Novo Peptide Sequencing via Probabilistic Network Modeling
                  </p>
                  <p className="text-sm text-muted-foreground">Ari Frank, Pavel Pevzner (2005)</p>
                  <p className="text-sm text-muted-foreground">Analytical Chemistry, 77 (4), 964-973</p>
                </div>
                <a
                  href="https://doi.org/10.1021/ac048788h"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>DOI</span>
                </a>
              </div>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Masena spektrometrija i analiza peptida</h2>
          <ul className="space-y-4">
            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="7">[7]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Mass Spectrometer</p>
                  <p className="text-sm text-muted-foreground">Eshita Garg, Muhammad Zubair</p>
                </div>
                <a
                  href="https://www.ncbi.nlm.nih.gov/books/NBK589702/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Link</span>
                </a>
              </div>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Dodatno korišćena literatura</h2>
          <ul className="space-y-4">
            <li className="border-b pb-4 relative pl-8">
              <span className="absolute left-0 top-0 font-semibold" id="8">[8]</span>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Codon Chart: Table, Amino Acids & RNA Wheel Explained</p>
                  <p className="text-sm text-muted-foreground">Sanju Tamang (2024)</p>
                </div>
                <a
                  href="https://microbenotes.com/codon-chart-table-amino-acids/#:~:text=Amino%20Acid%20Codon%20Wheel%20(RNA%20Codon%20Wheel)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Link</span>
                </a>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
