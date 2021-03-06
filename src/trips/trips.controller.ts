import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from '@Auth/get-user.decorator';
import { User } from '@Auth/user.entity';

import { Params } from '../models/params.model';
import { Trip } from '../trips/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripsService } from './trips.service';
@UseGuards(AuthGuard())
@Controller('trips')
export class TripsController {

  public constructor(private readonly tripsService: TripsService) {
  }

  @Get()
  public async getAllTrips(
    @GetUser() user: User,
    @Query() params: Params,
  ): Promise<Trip[]> {
    return this.tripsService.getAllTrips(user, params);
  }

  @Get('/:id')
  public async getTripById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Trip> {
    return this.tripsService.getTripById(id, user);
  }

  @Post()
  @UsePipes(ValidationPipe)
  // tslint:disable-next-line: prefer-function-over-method
  public async createTrip(
    @Body() createTripDto: CreateTripDto,
    @GetUser() user: User,
  ): Promise<Trip> {
    return TripsService.createTrip(createTripDto, user);
  }

  @Delete('/:id')
  public async deleteTrip(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Trip> {
    return this.tripsService.deleteTrip(id, user);
  }
}
