# Rezime :dna:

Ovaj rad predstavlja elektronsku lekciju posvećenu sekvenciranju antibiotika, sa fokusom na interaktivno upoznavanje sa različitim algoritamskim pristupima. Lekcija obuhvata teorijsko objašnjenje i vizuelizaciju sledećih algoritama za sekvenciranje proteina: **gruba sila**, **Branch and Bound**, **Leaderboard**, **spektralna konvolucija** i **DeepNovo sekvenciranje**. Korisnicima je omogućeno da prate izvršavanje algoritama korak po korak, sa opcijama pauziranja i ponavljanja, čime se olakšava razumevanje kompleksnih procesa sekvenciranja. Ova interaktivna platforma može služiti kao edukativni alat za studente i predavače u oblasti bioinformatike.

# Sadržaj 📝

* Folder **frontend** sadrži sav kod vezan za klijentsku aplikaciju
* Folder **backend** sadrži sav kod vezan za serversku aplikaciju
* Folder **docker** sadrži docker fajlove koji se koriste da se aplikacija pokrene
* Folder **tex** sadrži master tezu u PDF-u koja je pisana u latexu kao i sve propratne fajlove koji su korišćeni

# Korišćenje aplikacije 🛠️
Pokretanje aplikacije može da se odradi na nekoliko načina gde je samo potrebno da postoji **Docker** i **Docker Compose** alat:
* Docker Compose - najjednostavniji način pokretanja aplikacije uz korišćenje Docker alata
* Direktno pokretanje komponenti - pokretanje posebno Frontend i posebno Backend komponenti
* Google Cloud Run (GCR) - ova aplikacija je dostupna za korišćenje preko Google Cloud Run platforme na sledećem linku https://antibiotic-sequencing-304513663933.us-central1.run.app/

## Docker Compose ![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
Da bi se projekat pokrenuo potrebno je pozicionirati se u **/docker** direktorijum i pokrenuti sledeću komandu:
<br>
`docker-compose up -d --build`

Ova komanda pokreće dva kontejnera. Frontend delu aplikacije može da se pri-
stupi tako što se u veb pregladaču otvori http://localhost:3000, dok se backend deo
aplikacije nalazi na http://localhost:8000.

## Direktno pokretanje komponenti :gear:
Da bi se direktno pokrenuo Frontend aplikacije potrebno je imati instaliran **Node 18** kao i **npm 10** paket menadžer. Potrebno je pozicionirati se u **/frontend** direktorijum i pokrenuti naredne komande:
<br>
```
npm install
npm run build
npm run start
```
Nakon pokretanja ovih komandi klijentskom delu aplikacije može da se pristupi iz veb pregledača na adresi **http://localhost:3000**.

Da bi se direktno pokrenuo Backend aplikacije potrebno je imati instaliran **Python 3.12** kao i **pip** paket menadžer. Potrebno je pozicionirati se u **/backend** direktorijum i izvršiti naredne komande:
<br>
```
python -m venv venv
venv\Scripts\activate
pip install pipenv
pipenv install -d
cd src
python manage.py runserver
```
Pokretanjem ovih komandi kreiraćemo virtuelno okruženje u kom će se instalirati sve zavisnosti ove aplikacije. Za praćenje verzije korišćenih biblioteka korišćen je **Pipfile** i zato mora da se instalira i **pipenv**. Nakon pokretanja serverskom delu
aplikacije mogu se slati zahtevi na adresu **http://localhost:8000**.

## Google Cloud Run (GCR) ![Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run-blue?logo=googlecloud)
Ova aplikacija je dostupna za korišćenje preko Google Cloud Run platforme na sledećem linku https://antibiotic-sequencing-304513663933.us-central1.run.app/.
