"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Database, Microscope, Network, Zap, Code, BarChart, X } from "lucide-react"
import Link from "next/link"

export default function DeepNovoPage() {
  const [activeTab, setActiveTab] = useState("background")  
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const openLightbox = (imageSrc: string) => {
    setLightboxImage(imageSrc)
    document.body.style.overflow = "hidden" // Prevent scrolling when lightbox is open
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    document.body.style.overflow = "" // Restore scrolling
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-12">
        <div className="bg-indigo-100 dark:bg-indigo-900/20 p-4 rounded-full mb-6">
          <Brain className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">
          Metoda za De Novo Sekvenciranje Peptida Zasnovana na Dubokom Učenju
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl text-center">
          Pristup sekvenciranju peptida koji koristi duboko učenje za identifikaciju sekvenci
          aminokiselina bez oslanjanja na baze podataka
        </p>
      </div>

      <Tabs defaultValue="background" value={activeTab} onValueChange={setActiveTab} className="w-full mb-12">
        <TabsList className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 w-full gap-2 sm:gap-0 mb-6">
          <TabsTrigger value="background" className="w-full justify-start sm:justify-center">
            Postojeće tehnike i problemi
          </TabsTrigger>
          <TabsTrigger value="deepnovo" className="w-full justify-start sm:justify-center">
            DeepNovo
          </TabsTrigger>
          <TabsTrigger value="architecture" className="w-full justify-start sm:justify-center">
            Arhitektura
          </TabsTrigger>
          <TabsTrigger value="results" className="w-full justify-start sm:justify-center">
            Rezultati
          </TabsTrigger>
        </TabsList>

        <TabsContent value="background" className="mt-8">
          <div className="prose prose-lg max-w-none">

            <h3 className="text-xl font-semibold mb-3">Postojeće tehnike</h3>
            <p className="text-muted-foreground mb-6">
              Trenutne tehnike za sekvenciranje peptida (poput pretraživanja baze podataka,
              {" "}<span className="italic">de novo</span> sekvenciranja, kao i raznih algoritamskih pristupa) mogu imati poteškoća u
              radu sa novim, složenim ili nepotpunim podacima. Pristup pretraživanja baze
              podataka oslanja se na poređenje eksperimentalnih podataka sa bazom podataka
              poznatih proteinskih sekvenci, ali neki od problema u ovom pristupu su sledeći:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Database className="h-6 w-6 text-red-500 mr-3" />
                  <h4 className="text-lg font-semibold">Nepoznati proteini</h4>
                </div>
                <p className="text-muted-foreground">
                  Novi proteini koji nikada ranije nisu viđeni neće se podudarati ni sa čim u bazi podataka, što dovodi
                  do nemogućnosti identifikacije.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Microscope className="h-6 w-6 text-red-500 mr-3" />
                  <h4 className="text-lg font-semibold">Nedostajući podaci</h4>
                </div>
                <p className="text-muted-foreground">
                  Podaci generisani iz eksperimenata masene spektrometrije mogu biti pogrešni i nepotpuni, što otežava
                  pouzdano poređenje.
                </p>
              </Card>
            </div>

            <p className="text-muted-foreground space-y-2 gap-6 mb-8">
              Pristup <span className="italic">de novo</span> sekvenciranja pokušava izgraditi sekvencu peptida iz početka,
              bez oslanjanja na bazu podataka i koristeći samo podatke koji su dobijeni masenom
              spektrometrijom. U okviru ovog pristupa koriste se i različiti algoritmi, kao što su
              pristup grubom silom, <span className="italic">Branch and Bound</span>, 
              {" "}<span className="italic">Leaderboard</span> algoritam, kao i spektralna
              konvolucija, koji pokušavaju da generišu sekvence peptida i da porede njihove teo-
              rijske spektre sa eksperimentalnim. Međutim, iako koristan za identifikaciju novih
              peptida, <span className="italic">de novo</span> pristup je često manje precizan i računski zahtevan.
              <span className="italic">DeepNovo</span> kombinuje prednosti oba pristupa koristeći duboko učenje za poboljšanje tačnosti de novo sekvenciranja.
            </p>

            <h3 className="text-xl font-semibold mb-3">Računska složenost</h3>
            <p className="text-muted-foreground mb-4">
              <span className="italic">De novo</span> sekvenciranje, koje pokušava rekonstruisati sekvencu peptida bez oslanjanja na bazu podataka,
              suočava se sa značajnim računskim izazovima:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Eksponencijalni rast prostora pretrage sa povećanjem dužine peptida</li>
              <li>Potreba za složenim algoritmima za interpretaciju spektralnih podataka</li>
              <li>Teškoće u razlikovanju izobaričnih aminokiselina (aminokiseline sa istom ili vrlo sličnom masom)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Tehnike zasnova na De Novo sekvenciranju</h3>
            <p className="text-muted-foreground mb-4">
              Pored <span className="italic">DeepNovo</span> tehnike koja će biti opisana u ovom radu, postoje i još neke tehnike zasnovane na De Novo principu:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong>PEAKS</strong> <Link href="/literature#4" className="text-blue-600 underline hover:text-blue-800">[4]</Link> - koristi direktne aciklične grafove</li>
              <li><strong>Novor</strong> <Link href="/literature#5" className="text-blue-600 underline hover:text-blue-800">[5]</Link> - koristi klasifikatore mašinskog učenja da odredi sekvencu aminokiselina sa najvećom verovatnoćom </li>
              <li><strong>PepNovo</strong> <Link href="/literature#6" className="text-blue-600 underline hover:text-blue-800">[6]</Link> - koristi modelovanje verovatnoća pomoću grafova</li>
            </ul>

            <p className="text-muted-foreground">
              <span className="italic">DeepNovo</span> je dizajniran da prevazilazi računske izazove koristeći moć dubokog učenja za direktno predviđanje
              sekvenci aminokiselina iz podataka dobijenih masenom spektrometrijom, bez potrebe za bazom podataka referentnih sekvenci, a rezultati
              će pokazati da je bolji i od drugih metoda koje su zasnovane na de novo principu.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="deepnovo" className="mt-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Šta je DeepNovo?</h2>
            <p className="text-muted-foreground mb-6">
              <span className="italic">DeepNovo</span> <Link href="/literature#3" className="text-blue-600 underline hover:text-blue-800">[3]</Link> je metoda zasnovana na dubokom učenju koja poboljšava sekvenciranje peptida koristeći algoritam
              za predviđanje sekvenci aminokiselina iz podataka generisanih masenom spektrometrijom.
            </p>

            <div className="gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Kako funkcioniše?</h3>
                <p className="text-muted-foreground mb-4">
                  <span className="italic">DeepNovo</span> koristi duboke neuronske mreže — vrstu mašinskog učenja koja se pokazala efikasnom sa
                  složenim podacima. Mreža je trenirana da predviđa sekvencu aminokiselina iz podataka dobijenih masenom spektrometrijom.
                </p>
                <p className="text-muted-foreground">
                  Osnovna ideja je da model dubokog učenja može naučiti obrasce u podacima masene spektrometrije i
                  davati predviđanja o sekvenci peptida bez potrebe za oslanjanjem na referentnu bazu podataka.
                </p>
                
                <p className="text-muted-foreground mb-6">
                  Ova inovativna metoda pokazuje značajno poboljšanje u tačnosti sekvenciranja, posebno u slučajevima kada
                  su peptidne sekvence nove i ne podudaraju se ni sa jednom poznatom proteinskom bazom podataka.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Ključne karakteristike DeepNovo-a</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Database className="h-6 w-6 text-indigo-500 mr-3" />
                  <h4 className="text-lg font-semibold">De novo sekvenciranje peptida</h4>
                </div>
                <p className="text-muted-foreground">
                  Za razliku od metoda zavisnih od baze podataka, DeepNovo ne treba bazu podataka poznatih proteinskih
                  sekvenci. Radi analiziranjem sirovih podataka masene spektrometrije i direktnim predviđanjem sekvence peptida.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Brain className="h-6 w-6 text-indigo-500 mr-3" />
                  <h4 className="text-lg font-semibold">Model dubokog učenja</h4>
                </div>
                <p className="text-muted-foreground">
                  DeepNovo koristi rekurentnu neuronsku mrežu (<strong>RNN</strong>) sa arhitekturom dugog kratkoročnog pamćenja (<strong>LSTM</strong>).
                  Ova vrsta neuronske mreže je posebno dobra za rukovanje sekvencijalnim podacima, poput sekvenci
                  aminokiselina, gde je redosled elemenata (aminokiselina) veoma važan.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Zap className="h-6 w-6 text-indigo-500 mr-3" />
                  <h3 className="text-xl font-semibold">Poboljšana tačnost</h3>
                </div>
                <p className="text-muted-foreground">
                  Model dubokog učenja daje veoma precizna predviđanja, čak i u slučajevima gde tradicionalne metode mogu
                  imati poteškoća.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Network className="h-6 w-6 text-indigo-500 mr-3" />
                  <h3 className="text-xl font-semibold">Prilagodljivost</h3>
                </div>
                <p className="text-muted-foreground">
                  Kako više podataka postaje dostupno, model se može ponovno trenirati da poboljša svoja predviđanja,
                  čineći ga skalabilnim za nove primene.
                </p>
              </Card>
            </div>

            <h3 className="text-xl font-semibold mb-3">Treniranje modela</h3>
            <p className="text-muted-foreground mb-4">
              <span className="italic">DeepNovo</span> se trenira na velikom skupu podataka poznatih sekvenci peptida i njihovih odgovarajućih podataka
              masene spektrometrije. Uči mapirati eksperimentalne podatke na sekvence peptida kroz proces nazvan
              nadgledano učenje.
            </p>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg mb-6">
              <h4 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300">Proces treniranja</h4>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Prikupljanje peptidnih sekvenci i njihovih spektara</li>
                <li>Pretprocesiranje spektralnih podataka za normalizaciju i uklanjanje šuma</li>
                <li>Treniranje neuronske mreže da predviđa aminokiseline na osnovu spektralnih karakteristika</li>
                <li>Optimizacija modela korišćenjem tehnika kao što su regularizacija i rano zaustavljanje</li>
                <li>Validacija modela na nezavisnom skupu podataka za procenu performansi</li>
              </ol>
            </div>

            <p className="text-muted-foreground">
              Jednom treniran, <span className="italic">DeepNovo</span> može analizirati nove spektre i predviđati sekvence peptida sa visokom
              tačnošću, čak i za peptide koji nisu prisutni u postojećim bazama podataka.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="mt-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mb-4">DeepNovo arhitektura neuronske mreže</h2>
            <p className="text-muted-foreground mb-6">
              Srce <span className="italic">DeepNovo</span> pristupa je njegov model dubokog učenja (Slika 1), koji se sastoji od:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-2 text-muted-foreground mt-2">
              <li>
                <strong>Konvolutivne neuronske mreže (CNN)</strong>
              </li>
              <li>
                <strong>Rekurentne neuronske mreže (RNN)</strong>
              </li>
            </ul>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
              <div className="order-1 lg:order-2">
                <h3 className="text-xl font-semibold mb-3">Konvolutivne neuronske mreže (CNN)</h3>
                <p className="text-muted-foreground mb-4">
                  <strong>CNN</strong> je veoma efikasna mreža i koristi se za otkrivanje značajnih šablona u
                  ulaznim podacima. Oslanja se na tehniku <span className="italic">sliding window</span> i procesuira male lokalne
                  regione koristeći filtere. Ova mreža je trenirana da prepozna lokalne šablone, različite
                  tipove jona i da pretvori sirove podatke u reprezentaciju svojstava ulaznih podataka.
                </p>
                <p className="text-muted-foreground mb-4">
                  U ovom modelu su korišćene 2 <strong>CNN</strong> mreže, jedna je spektralna <strong>CNN</strong> a druga jonska <strong>CNN</strong>.
                </p>

                <h4 className="font-semibold mb-3">Spektralna CNN</h4>
                <p className="text-muted-foreground mb-4">
                  Kao deo preprocesiranja podataka spektar dobijen masenom spektrometrijom transformiše se u vektor fiksne dužine (npr. 50.000
                  elemenata) i dobijeni vektor se prosleđuje ovoj mreži. Na ovaj način, <strong>CNN</strong> {" "}
                  uči šabloni nad svim podacima spektra i rezultat ove mreže se dalje koristi u rekurentnoj mreži. Konvolutivna 
                  mreža se sastoji od 3 konvolutivna sloja i koristi <span className="italic">ReLu</span> aktivacionu funkciju. 
                  Ovo predstavlja značajan deo arhitekture jer može dosta da poboljša preciznost sekvenciranja i može da nauči šablone
                  u spektru čak i ako su neki maksimumi u spektru pomereni zbog šuma.
                </p>

                <h4 className="font-semibold mb-3">Jonska CNN</h4>
                <p className="text-muted-foreground mb-4">
                  Ova mreža se koristi tokom odabira sledeće aminokiseline u peptidu i služi da iz malog segmenta 
                  spektra izdvoji najvažnije informacije. Za svakog kandidata aminokiseline, mreža analizira deo spektar i procenjuje da li
                  se očekivani jonski fragmenti pojavljuju na odgovarajućim mestima. Prilikom svakog koraka predviđanja 
                  sledeće aminokiseline <strong>DeepNovo</strong> koristi dosadašnje predikcije da izračuna prefiksnu masu,{" "}
                  na osnovu koje generiše parcijalni teorijski spektar i proverava da li eksperimentalni spektar podržava ovaj izbor.
                  Ovaj deo modela je bitan u slučaju da su podaci šumoviti ili da neke mase nedostaju u eksperimentalnom spektru.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Rekurentne neuronske mreže (RNN)</h3>
                <p className="text-muted-foreground mb-4">
                  Ove mreže su dizajnirane za predviđanje sekvenci, gde izlaz ne zavisi samo od trenutnog podatka 
                  u eksperimentalnom spektru, već i od podataka koji su mu prethodili. U kontekstu sekvenciranja 
                  peptida, <strong>RNN</strong> može naučiti kako jedna aminokiselina utiče na sledeću u sekvenci, što je ključno za tačno predviđanje.
                </p>
                <p className="text-muted-foreground">
                  DeepNovo koristi posebnu vrstu RNN-a koja se zove <span className="italic">Long Short-Term Memory</span>
                  {" "}(<strong>LSTM</strong>). Ključna prednost <strong>LSTM</strong> mreža je ta što bolje prati duže zavisnosti,
                  konkretno peptidi mogu da budu različitih dužina a ova mreža pamti i odnose koji su udaljeni. 
                  Ovo je bitno jer početak sekvence može da utiče na predviđanje neke kasnije aminokiseline.
                </p>
                <p className="text-muted-foreground">
                  Ova mreža se sastoji od 1 sloja LTSM-a i radi tako što dodaje jednu po jednu aminokiselinu sve dok ne stigne do kraja peptida.
                  U svakom koraku LTSM mreža gleda:
                </p>

                <ol className="list-disc pl-8 mb-4 space-y-2 text-muted-foreground mt-2">
                  <li>
                    <strong>Šta je mreža naučila do sada - trenutno stanje</strong>
                  </li>
                  <li>
                    <strong>Sledeća aminokiseline koja je kandidat</strong>
                  </li>
                  <li>
                    <strong>Svojstva spektra koja su dobijana od konvolutivne mreže</strong>
                  </li>
                </ol>

                <p className="text-muted-foreground">
                  Kao izlaz iz ove mreže koristi se <span className="italic">softmax</span> projekcija i ona određuje za svaku
                  aminokiselinu koja je verovatnoća da se ona nalazi na sledećoj poziciji u sekvenci.
                  Dodatno, koristi se <span className="italic">beam search</span>, odnosno ne bira se samo aminokiselina sa 
                  najvećom verovatnoćom nego se čuva više kandidata koji imaju veću verovatnoću. Ovim
                  postupkom se povećava preciznost i gledaju se alternativna rešenja. Na kraju se
                  sekvence rangiraju po rezultatu koliko se poklapaju sa traženim spektrom i koliko imaju grešaka i bira najbolja moguća.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-video">
                  <button
                    onClick={() => openLightbox("/images/deep_novo_architecture.jpeg")}
                    className="relative w-full max-w-full h-[500px] mb-2 cursor-pointer group"
                    aria-label="Otvori sliku u punoj veličini"
                  >
                    <Image
                      src="/images/deep_novo_architecture.jpeg?height=300&width=500"
                      alt="Arhitektura DeepNovo pristupa"
                      fill
                      className="object-contain"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="sr-only">Klikni da uvećaš</span>
                    </div>
                  </button>
                  <p className="text-sm text-muted-foreground text-center">
                    Slika 1: Arhitektura <span className="italic">DeepNovo</span> pristupa <Link href="/literature#3" className="text-blue-600 underline hover:text-blue-800">[3]</Link>
                    <span className="text-xs block text-primary-foreground/70 italic mt-1">
                      Kliknite na sliku za uvećani prikaz
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Ključne komponente</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Code className="h-6 w-6 text-indigo-500 mr-3" />
                  <h4 className="text-lg font-semibold">Enkoder spektra</h4>
                </div>
                <p className="text-muted-foreground">
                  Transformiše sirove podatke iz spektra u vektorske reprezentacije koje neuronska mreža može efikasno
                  obraditi.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Brain className="h-6 w-6 text-indigo-500 mr-3" />
                  <h4 className="text-lg font-semibold">LSTM jedinice</h4>
                </div>
                <p className="text-muted-foreground">
                  Obrađuju sekvencijalne informacije i održavaju kontekst kroz celu sekvencu peptida.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <BarChart className="h-6 w-6 text-indigo-500 mr-3" />
                  <h4 className="text-lg font-semibold">Sloj za predviđanje</h4>
                </div>
                <p className="text-muted-foreground">
                  Generiše verovatnoće za svaku moguću aminokiselinu na svakoj poziciji u sekvenci.
                </p>
              </Card>
            </div>

            <p className="text-muted-foreground">
              Ova složena arhitektura omogućava <span className="italic">DeepNovo</span>-u da efikasno uči iz podataka masene spektrometrije i predviđa
              sekvence peptida sa visokom tačnošću, čak i u prisustvu šuma ili nepotpunih podataka.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Ključni rezultati</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Poboljšana tačnost</h3>
                <p className="text-muted-foreground mb-4">
                  DeepNovo metoda nadmašuje tradicionalne metode, posebno u slučajevima kada su sekvence peptida nove i
                  ne podudaraju se ni sa jednom poznatom proteinskom bazom podataka.
                </p>
                <p className="text-muted-foreground">
                  Eksperimenti su pokazali značajno poboljšanje u tačnosti identifikacije aminokiselina, posebno za
                  složene peptide.
                </p>
                <p className="text-muted-foreground">
                  Za potrebe testiranja naučnici su koristili podatke različitih vrsta. Na Slici 1. su prikazani rezultati
                  poređenja više algoritama. Da bi se merila preciznost rešenja poređena je prava sekvenca aminokiselinama
                  sa onom koja je dobijena na osnovu spektra. Takođe, koristile su se različite metrike:
                </p>
                <div className="p-6 mb-6">
                  <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Preciznost</strong> (eng. <span className="italic">precision</span>) - predstavlja odnos broja peptida koje je 
                      generisao algoritam koji su zapravo tačni i ukupnog broja peptida koje je generisao</li>
                    <li><strong>Odziv</strong> (eng. <span className="italic">recall</span>) - predstavlja odnos broja tačnih peptida koje je
                      generisao i koliko je ukupno bilo peptida koji su se tražili</li>
                    <li><strong>AUC-PR</strong> - predstavlja koliko dobro model balansira preciznost i odziv, što je veća vrednost bolje će biti i preformanse</li>
                  </ol>
                </div>
                <p className="text-muted-foreground">
                  Može se primetiti da je <span className="italic">DeepNovo</span> model na svakom od datih skupa podataka imao bolje rezultate. 
                  <span className="italic">DeepNovo</span> je imao i veću preciznost u traženju peptida 
                  kao i veći odziv, samim tim i odnos <span className="italic">AUC-PR</span> krive je bolji nego kod konkurenata.
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-video">
                  <button
                    onClick={() => openLightbox("/images/deep_novo_comparison.jpeg")}
                    className="relative w-full max-w-full h-[500px] mb-2 cursor-pointer group"
                    aria-label="Otvori sliku u punoj veličini"
                  >
                    <Image
                      src="/images/deep_novo_comparison.jpeg?height=300&width=500"
                      alt="Grafikon tačnosti"
                      fill
                      className="object-contain"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="sr-only">Klikni da uvećaš</span>
                    </div>
                  </button>
                  <p className="text-sm text-muted-foreground text-center">
                    Slika 1: Poređenje rezultata <span className="italic">DeepNovo</span> algoritma sa drugim algoritmima <Link href="/literature#3" className="text-blue-600 underline hover:text-blue-800">[3]</Link>
                    <span className="text-xs block text-primary-foreground/70 italic mt-1">
                      Kliknite na sliku za uvećani prikaz
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Zaključak</h3>
            <p className="text-muted-foreground mb-4"><span className="italic">DeepNovo</span> je uspešno primenjen u nekoliko realnih scenarija:</p>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg mb-6">
              <h4 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300">
                Identifikacija novih antimikrobnih peptida
              </h4>
              <p className="text-muted-foreground mb-4">
                <span className="italic">DeepNovo</span> je korišćen za identifikaciju novih antimikrobnih peptida iz organizama koji nisu modelovali, gde
                tradicionalne metode zasnovane na bazama podataka nisu bile efikasne.
                <br/>
                Rezultati su doveli do otkrića nekoliko potencijalnih kandidata za nove antibiotike, demonstrirajući
                praktičnu vrednost ovog pristupa u farmaceutskim istraživanjima.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg mb-6">
              <h4 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300">
                Analiza post-translacionih modifikacija
              </h4>
              <p className="text-muted-foreground mb-4">
                <span className="italic">DeepNovo</span> je pokazao izuzetnu sposobnost u identifikaciji peptida sa složenim post-translacionim
                modifikacijama (promenama koje se dese u proteinu nakon njegove kreacije), koje su često izazov za tradicionalne metode sekvenciranja.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg mb-6">
              <h4 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300">
                <span className="italic">DeepNovo</span> nije specifičan za određenu vrstu
              </h4>
              <p className="text-muted-foreground mb-4">
                Uspešnom primenom algoritma na različitim vrstama i organizmima povećava se sama značaj ovog pristupa,
                samim tim <span className="italic">DeepNovo</span> može da se primenim na širem spektru stvari.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {lightboxImage && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
                <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
                  <Image
                    src={lightboxImage || "/placeholder.svg"}
                    alt="Enlarged image"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeLightbox()
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Close lightbox"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            )}
    </div>
  )
}

