import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import {
  GoogleMap,
  MapInfoWindow,
  MapGeocoder,
  MapGeocoderResponse,
} from '@angular/google-maps';

@Component({
  selector: 'app-show-school',
  templateUrl: './show-school.page.html',
  styleUrls: ['./show-school.page.scss'],
})
export class ShowSchoolPage implements OnInit {

  school:any=null;
  @ViewChild('search')
  public searchElementRef!: ElementRef;
  @ViewChild('myGoogleMap', { static: false })
  map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false })
  info!: MapInfoWindow;
  latitude!: any;
  longitude!: any;
  zoom = 12;
  maxZoom = 15;
  minZoom = 8;
  center!: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    mapTypeId: 'hybrid',
  };
  markers = [] as any;
  address = '';
  

  constructor( private navController: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService,
    private geoCoder: MapGeocoder 
  ) { }

  ngOnInit() {
    this.fetchSchool();

    navigator.geolocation.getCurrentPosition((position) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      // Set marker position
      this.setMarkerPosition(this.latitude, this.longitude);
    });

  }

  async fetchSchool(){
    this.dataService.get('schools').then((data)=>{
      let schools = data.data;
      this.school = schools.find((school:any)=>school.id == this.route.snapshot.params['id']);

      console.log(this.school);
    })
  }

  async resolve(id:number) {
    await this.navController.navigateForward('/tabs/complaint/' + id + '/resolve');
  }

  async deleteModal(item: any) {
    const alert = await this.alertController.create({
     header: 'Confirm the deletion?',
     buttons: [
       {
         text: 'Cancel',
         role: 'cancel',
         cssClass: 'secondary',
       },
       {
         text: 'Delete',
         handler: () => {
           console.log(item.id);
          /*  this.service.delete(item.id).then(async ()=>{
             await this.navController.navigateForward('/tabs/complaint');
           }) */
           
         },
       },
     ],
   });
   await alert.present(); 
 }


 setMarkerPosition(latitude: any, longitude: any) {
  // Set marker position
  this.markers = [
    {
      position: {
        lat: latitude,
        lng: longitude,
      },
      options: {
        animation: google.maps.Animation.DROP,
        draggable: true,
      },
    },
  ];
}

 eventHandler(event: any, name: string) {
  // console.log(event, name);

  switch (name) {
    case 'mapDblclick': // Add marker on double click event
      break;

    case 'mapDragMarker':
      break;

    case 'mapDragend':
      this.getAddress(event.latLng.lat(), event.latLng.lng());
      break;

    default:
      break;
  }
} 



 getAddress(latitude: any, longitude: any) {
  this.geoCoder
    .geocode({ location: { lat: latitude, lng: longitude } })
    .subscribe((addr: MapGeocoderResponse) => {
      if (addr.status === 'OK') {
        if (addr.results[0]) {
          this.zoom = 12;
          this.address = addr.results[0].formatted_address;
        } else {
          this.address = "";
          window.alert('No results found');
        }
      } else {
        this.address = "";
        window.alert('Geocoder failed due to: ' + addr.status);
      }
    });
}

  back(){
    this.navController.navigateBack('tabs/complaint');
  }

  open(item: any) {
    this.navController.navigateForward('/tabs/complaint/' + item.id + '/edit');
  }


}
