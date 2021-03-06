import { UnauthorizedException } from '@nestjs/common';
import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';

import { User } from '../auth/user.entity';
import { UserType } from '../enums/user-type.enum';
import { Params } from '../models/params.model';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './trip.entity';

@EntityRepository(Trip)
export class TripRepository extends Repository<Trip>{

  public async customerGetAllTrips(user: User): Promise<Trip[]> {
    const query: SelectQueryBuilder<Trip> = this.createQueryBuilder('trip');
    query.where('trip.userId = :userId', { userId: user.id });
    const trips: Trip[] = await query.getMany();

    return trips;
  }

  public async getAllTrips(
    user: User,
    params: Params,
  ): Promise<Trip[]> {
    let query: SelectQueryBuilder<Trip>;

    if (user.userType === UserType.tripOrganizer) {
      if (!user.approved) {
        throw new UnauthorizedException('Your account must be approved.');
      }
      query = this.createQueryBuilder('trip');
      query.where('trip.userId = :userId', { userId: user.id });

      return query.getMany();
    }
    if (params.active === 'true') {
      query = this.createQueryBuilder('trip')
        .where({ active: true });

      return query.getMany();
    }
    if (params.active === 'false') {
      query = this.createQueryBuilder('trip')
        .where({ active: false });

      return query.getMany();
    }
    query = this.createQueryBuilder('trip');

    return query.getMany();
  }

  public static async createTrip(
    createTripDto: CreateTripDto,
    user: User,
  ): Promise<Trip> {
    if (user.approved && user.userType === UserType.tripOrganizer) {
      const trip: Trip = new Trip(createTripDto);

      trip.user = user;

      await trip.save();

      delete trip.user.password;
      delete trip.user.username;
      delete trip.user.gender;
      delete trip.user.homeAddress;
      delete trip.user.email;
      delete trip.user.approved;
      delete trip.user.userType;
      delete trip.user.city;
      delete trip.user.salt;
      delete trip.user.trips;
      delete trip.user.dateOfBirth;
      delete trip.user.country;
      delete trip.userId;

      return trip;
    }
    if (user.userType !== UserType.tripOrganizer) {
      throw new UnauthorizedException('Only Trip Organizers can create a trip.');
    }
    throw new UnauthorizedException('Your account must be approved.');
  }
}
